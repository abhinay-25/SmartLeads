import { apiClient } from './apiClient';
import type { Lead, LeadsQueryParams, LeadsResponse, ApiResponse, CreateLeadDto, UpdateLeadDto, DashboardStats } from '@/types';

// ── Helpers ──────────────────────────────────────────────────────────

/**
 * Converts LeadsQueryParams to a plain query string object for Axios.
 * Strips undefined/empty values so the URL stays clean.
 */
const toQueryObject = (params: LeadsQueryParams): Record<string, string> => {
  const q: Record<string, string> = {};
  if (params.page   != null)           q['page']   = String(params.page);
  if (params.limit  != null)           q['limit']  = String(params.limit);
  if (params.sort)                     q['sort']   = params.sort;
  if (params.search?.trim())           q['search'] = params.search.trim();
  if (params.status)                   q['status'] = params.status;
  if (params.source)                   q['source'] = params.source;
  return q;
};

// ── API calls ────────────────────────────────────────────────────────

/**
 * GET /api/v1/leads
 * Paginated, filtered, sorted list of leads.
 */
export const fetchLeads = async (params: LeadsQueryParams): Promise<LeadsResponse> => {
  const { data } = await apiClient.get<LeadsResponse>('/v1/leads', {
    params: toQueryObject(params),
  });
  return data;
};

/**
 * GET /api/v1/leads/:id
 */
export const fetchLeadById = async (id: string): Promise<Lead> => {
  const { data } = await apiClient.get<ApiResponse<Lead>>(`/v1/leads/${id}`);
  return data.data;
};

/**
 * POST /api/v1/leads
 */
export const createLead = async (data: CreateLeadDto): Promise<Lead> => {
  const response = await apiClient.post<ApiResponse<Lead>>('/v1/leads', data);
  return response.data.data;
};

/**
 * PATCH /api/v1/leads/:id
 */
export const updateLead = async (id: string, data: UpdateLeadDto): Promise<Lead> => {
  const response = await apiClient.patch<ApiResponse<Lead>>(`/v1/leads/${id}`, data);
  return response.data.data;
};

/**
 * DELETE /api/v1/leads/:id
 */
export const deleteLead = async (id: string): Promise<void> => {
  await apiClient.delete(`/v1/leads/${id}`);
};

/**
 * Download CSV export of filtered leads.
 */
export const exportLeads = async (params?: LeadsQueryParams): Promise<Blob> => {
  const { data } = await apiClient.get<Blob>('/v1/leads/export', {
    params,
    responseType: 'blob',
  });
  return data;
};

/**
 * GET /api/v1/leads/stats
 * Pipeline counts by status, source, and total.
 */
export const fetchLeadStats = async (): Promise<DashboardStats> => {
  const { data } = await apiClient.get<ApiResponse<DashboardStats>>('/v1/leads/stats');
  return data.data;
};
