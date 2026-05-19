// ──────────────────────────────────────────────────────
// Shared API + Domain Types
// ──────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  total:      number;
  page:       number;
  perPage:    number;
  totalPages: number;
  hasNext:    boolean;
  hasPrev:    boolean;
}

export interface SelectOption {
  label: string;
  value: string;
}

// ──────────────────────────────────────────────────────
// Lead domain types (must stay aligned with backend)
// ──────────────────────────────────────────────────────

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
export type LeadSource = 'website' | 'instagram' | 'referral' | 'social' | 'email' | 'other';
export type LeadSortOrder = 'latest' | 'oldest';

export interface Lead {
  _id:        string;
  name:       string;
  email:      string;
  phone?:     string;
  company?:   string;
  status:     LeadStatus;
  source:     LeadSource;
  notes?:     string;
  assignedTo?: string;
  createdAt:  string;
  updatedAt:  string;
}

export interface CreateLeadDto {
  name:       string;
  email:      string;
  phone?:     string;
  company?:   string;
  status:     LeadStatus;
  source:     LeadSource;
  notes?:     string;
}

export type UpdateLeadDto = Partial<CreateLeadDto>;

// ──────────────────────────────────────────────────────
// Query params — mirrors backend leadsQuerySchema
// ──────────────────────────────────────────────────────

export interface LeadsQueryParams {
  page?:      number;
  limit?:     number;
  sort?:      LeadSortOrder;
  search?:    string;
  status?:    LeadStatus;
  source?:    LeadSource;
}

// Paginated leads response shape
export interface LeadsResponse {
  success: boolean;
  message: string;
  data:    Lead[];
  meta:    PaginationMeta;
}

// Dashboard statistics shape
export interface DashboardStats {
  total:    number;
  byStatus: Record<string, number>;
  bySource: Record<string, number>;
}

