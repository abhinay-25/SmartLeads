import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchLeads, createLead, updateLead, deleteLead } from '@services/lead.service';
import type { LeadsQueryParams, LeadsResponse, CreateLeadDto, UpdateLeadDto } from '@/types';

// ── Query key factory ─────────────────────────────────────────────────
// Structured keys enable precise cache invalidation.
// e.g. queryClient.invalidateQueries({ queryKey: leadsKeys.all })

export const leadsKeys = {
  all:    ['leads']                              as const,
  lists:  () => ['leads', 'list']               as const,
  list:   (p: LeadsQueryParams) => ['leads', 'list', p] as const,
  detail: (id: string)          => ['leads', id]        as const,
  stats:  () => ['leads', 'stats']                      as const,
};

// ── useLeads — paginated + filtered list ──────────────────────────────

interface UseLeadsOptions {
  params:  LeadsQueryParams;
  enabled?: boolean;
}

export const useLeads = ({ params, enabled = true }: UseLeadsOptions) => {
  return useQuery<LeadsResponse>({
    queryKey:        leadsKeys.list(params),
    queryFn:         () => fetchLeads(params),
    enabled,
    staleTime:       0,      // always refetch when filter params change
    placeholderData: (prev) => prev, // keep previous page data while loading next page
  });
};

// ── useLeadsPrefetch — prefetch next page on hover ────────────────────

export const useLeadsPrefetch = () => {
  const qc = useQueryClient();

  return (params: LeadsQueryParams) => {
    void qc.prefetchQuery({
      queryKey: leadsKeys.list(params),
      queryFn:  () => fetchLeads(params),
      staleTime: 30_000,
    });
  };
};

// ── useLeadsInvalidate — called after create/update/delete ────────────

export const useLeadsInvalidate = () => {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: leadsKeys.lists() });
    qc.invalidateQueries({ queryKey: ['leads', 'stats'] }); // also invalidate dashboard stats if we had them
  };
};

// ── Mutations ─────────────────────────────────────────────────────────

export const useCreateLead = () => {
  const invalidate = useLeadsInvalidate();
  return useMutation({
    mutationFn: (data: CreateLeadDto) => createLead(data),
    onSuccess: () => invalidate(),
  });
};

export const useUpdateLead = () => {
  const invalidate = useLeadsInvalidate();
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeadDto }) => updateLead(id, data),
    onSuccess: (updatedLead) => {
      // Optimistically update the specific lead's cache if it's being viewed individually
      qc.setQueryData(leadsKeys.detail(updatedLead._id), updatedLead);
      invalidate();
    },
  });
};

export const useDeleteLead = () => {
  const invalidate = useLeadsInvalidate();
  return useMutation({
    mutationFn: (id: string) => deleteLead(id),
    onSuccess: () => invalidate(),
  });
};

// ── Dashboard Stats Hook ──────────────────────────────────────────────

export const useLeadStats = () => {
  return useQuery({
    queryKey: leadsKeys.stats(),
    queryFn:  () => import('@services/lead.service').then(m => m.fetchLeadStats()),
    staleTime: 60_000, // 1 minute stale time for dashboard metrics
  });
};
