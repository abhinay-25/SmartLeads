import { Users, Plus, Search, Download } from 'lucide-react';
import { PageHeader, PageContainer } from '@components/ui/Layout';
import { Card } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { EmptyState } from '@components/ui/StateViews';
import { ErrorState } from '@components/ui/StateViews';
import { useDocumentTitle } from '@hooks/useDocumentTitle';
import { useLeads } from '@hooks/useLeads';
import { useLeadFilters } from '@hooks/useLeadFilters';
import { LeadsToolbar } from './components/LeadsToolbar';
import { LeadsTable } from './components/LeadsTable';
import { LeadsPagination } from './components/LeadsPagination';
import { CreateLeadModal } from './components/CreateLeadModal';
import { EditLeadModal } from './components/EditLeadModal';
import { DeleteLeadModal } from './components/DeleteLeadModal';
import { RequirePermission } from '@components/ui/RequirePermission';
import { useExportLeads } from '@hooks/useExportLeads';
import { useState } from 'react';
import type { Lead } from '@/types';

// ── LeadsPage ─────────────────────────────────────────────────────────

const LeadsPage = () => {
  useDocumentTitle('Leads');

  // ── Modal state ────────────────────────────────────────────────
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editLead, setEditLead]         = useState<Lead | null>(null);
  const [deleteLead, setDeleteLead]     = useState<Lead | null>(null);

  // ── Filter state (URL-synced) ──────────────────────────────────
  const filters = useLeadFilters();
  const { downloadCSV, isExporting } = useExportLeads();

  // ── Data fetching ──────────────────────────────────────────────
  const { data, isLoading, isFetching, isError, error, refetch } = useLeads({
    params: filters.queryParams,
  });

  const leads      = data?.data    ?? [];
  const meta       = data?.meta;
  const totalCount = meta?.total   ?? 0;

  // ── Derived states ─────────────────────────────────────────────
  const isEmpty       = !isLoading && !isError && leads.length === 0;
  const isFiltered    = filters.hasActiveFilters;
  const showPagination = !isLoading && !isError && (meta?.totalPages ?? 0) > 1;

  return (
    <PageContainer>
      {/* ── Header ──────────────────────────────────────────────── */}
      <PageHeader
        title="Leads"
        description={
          isLoading
            ? 'Loading…'
            : isError
            ? 'Error loading leads'
            : `${totalCount.toLocaleString()} lead${totalCount !== 1 ? 's' : ''}`
        }
        actions={
          <div className="flex items-center gap-2">
            <RequirePermission permission="leads:export">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => downloadCSV(filters.queryParams)}
                loading={isExporting}
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                Export
              </Button>
            </RequirePermission>
            
            <RequirePermission permission="leads:create">
              <Button variant="primary" size="sm" id="add-lead-btn" onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                Add Lead
              </Button>
            </RequirePermission>
          </div>
        }
      />

      {/* ── Toolbar (search + filters) ───────────────────────────── */}
      <div className="mb-4">
        <LeadsToolbar
          searchInput={filters.searchInput}
          setSearchInput={filters.setSearchInput}
          status={filters.status}
          setStatus={filters.setStatus}
          source={filters.source}
          setSource={filters.setSource}
          sort={filters.sort}
          setSort={filters.setSort}
          hasActiveFilters={filters.hasActiveFilters}
          activeFilterCount={filters.activeFilterCount}
          resetFilters={filters.resetFilters}
        />
      </div>

      {/* ── Table card ───────────────────────────────────────────── */}
      <Card padding="none">
        {/* Error state */}
        {isError && !isLoading && (
          <ErrorState
            title="Failed to load leads"
            description={
              error instanceof Error
                ? error.message
                : 'An unexpected error occurred. Please try again.'
            }
            action={
              <Button variant="secondary" size="sm" onClick={() => refetch()}>
                Try again
              </Button>
            }
          />
        )}

        {/* Empty state — no results */}
        {isEmpty && (
          <EmptyState
            icon={
              isFiltered
                ? <Search className="h-5 w-5" aria-hidden="true" />
                : <Users className="h-5 w-5" aria-hidden="true" />
            }
            title={isFiltered ? 'No leads match your filters' : 'No leads yet'}
            description={
              isFiltered
                ? "Try adjusting your search or filters to find what you're looking for."
                : 'Add your first lead to start building your pipeline.'
            }
            action={
              isFiltered ? (
                <Button variant="secondary" size="sm" onClick={filters.resetFilters}>
                  Clear filters
                </Button>
              ) : (
                <RequirePermission permission="leads:create">
                  <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)}>
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    Add Lead
                  </Button>
                </RequirePermission>
              )
            }
          />
        )}

        {/* Table — shown when not in pure error/empty state */}
        {!isError && (
          <LeadsTable
            data={leads}
            isLoading={isLoading}
            isFetching={isFetching && !isLoading}
            sort={filters.sort}
            onSort={filters.setSort}
            onEdit={setEditLead}
            onDelete={setDeleteLead}
          />
        )}

        {/* Pagination footer */}
        {showPagination && meta && (
          <LeadsPagination
            meta={meta}
            onPage={filters.setPage}
            isFetching={isFetching}
          />
        )}

        {/* Simple page indicator when only 1 page */}
        {!isLoading && !isError && !isEmpty && !showPagination && meta && (
          <div className="border-t border-[hsl(var(--border-subtle))] px-4 py-3">
            <p className="text-[12px] text-[hsl(var(--text-tertiary))]">
              Showing{' '}
              <span className="font-medium text-[hsl(var(--text-primary))]">
                {leads.length}
              </span>{' '}
              of{' '}
              <span className="font-medium text-[hsl(var(--text-primary))]">
                {totalCount.toLocaleString()}
              </span>{' '}
              leads
            </p>
          </div>
        )}
      </Card>

      {/* ── Modals ─────────────────────────────────────────────────── */}
      <CreateLeadModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <EditLeadModal
        lead={editLead}
        onClose={() => setEditLead(null)}
      />

      <DeleteLeadModal
        lead={deleteLead}
        onClose={() => setDeleteLead(null)}
      />
    </PageContainer>
  );
};

export default LeadsPage;
