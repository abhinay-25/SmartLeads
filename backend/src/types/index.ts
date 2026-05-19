import type { Request } from 'express';

// ── User roles ───────────────────────────────────────────────────
export type UserRole = 'admin' | 'sales_user';

// ── JWT token payload (what we encode into the token) ────────────
export interface TokenPayload {
  sub: string;      // user _id (MongoDB ObjectId string)
  email: string;
  role: UserRole;
  name: string;
  iat?: number;     // issued at  (set by jwt.sign)
  exp?: number;     // expires at (set by jwt.sign)
}

// ── Authenticated request — populated by auth middleware ─────────
export interface AuthenticatedRequest extends Request {
  user: RequestUser;
}

export interface RequestUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// ── Lead domain ───────────────────────────────────────────────────
// Status values — lowercase internally, display as capitalised in UI
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';

// Source values — 'instagram' added per project spec
export type LeadSource = 'website' | 'instagram' | 'referral' | 'social' | 'email' | 'other';

// Sort shorthand — 'latest' = createdAt DESC, 'oldest' = createdAt ASC
export type LeadSortOrder = 'latest' | 'oldest';

// ── Pagination ────────────────────────────────────────────────────
export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ── Mongoose document helpers ─────────────────────────────────────
export interface TimestampFields {
  createdAt: Date;
  updatedAt: Date;
}

// ── Filter ────────────────────────────────────────────────────────
export interface LeadFilters {
  search?:     string | undefined;
  status?:     LeadStatus | undefined;
  source?:     LeadSource | undefined;
  assignedTo?: string | undefined;
  startDate?:  string | undefined;
  endDate?:    string | undefined;
}

// ── Extend Express Request with typed user ────────────────────────
declare global {
  namespace Express {
    interface Request {
      user?: RequestUser;
    }
  }
}
