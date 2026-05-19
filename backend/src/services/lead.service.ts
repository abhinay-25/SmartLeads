import type { PaginatedResult, PaginationOptions } from '../types/index';
import { Lead } from '@models/lead.model';
import type { ILead } from '@models/lead.model';
import { AppError } from '@utils/AppError';
import { buildPaginatedResult } from '@utils/apiResponse';
import { calcSkip, buildSortObject } from '@utils/pagination';
import { isValidObjectId } from '@utils/helpers';
import type { CreateLeadInput, UpdateLeadInput, LeadsQueryInput } from '@validators/lead.validator';
import type { FilterQuery } from 'mongoose';

// ─────────────────────────────────────────────────────────────────
// LeadService — all business logic lives here, not in controllers
// ─────────────────────────────────────────────────────────────────

/**
 * buildLeadFilter
 *
 * Converts validated query input into a Mongoose FilterQuery.
 *
 * Search strategy:
 * ─────────────────
 * We use case-insensitive $regex on `name` and `email` fields via $or.
 * This enables partial substring matching (e.g. "Rah" matches "Rahul").
 *
 * Why NOT $text index?
 * - $text only matches whole words, not substrings
 * - "john@" won't match with $text, but will with $regex
 * - $text also conflicts with $or + field-level queries in complex filters
 *
 * Performance note:
 * - $regex /^term/i (anchored) uses the B-tree index efficiently
 * - $regex /term/i (unanchored) does a full collection scan
 * - For >100k docs, consider MongoDB Atlas Search
 *
 * Combined filters work correctly:
 *   { $and: [$or (search), { status }, { source }, { createdAt }] }
 */
const buildLeadFilter = (query: Partial<LeadsQueryInput>): FilterQuery<ILead> => {
  const conditions: FilterQuery<ILead>[] = [];

  // ── Search: name OR email, case-insensitive partial match ─────────
  if (query.search?.trim()) {
    const escaped = query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex   = new RegExp(escaped, 'i');
    conditions.push({
      $or: [
        { name:  { $regex: regex } },
        { email: { $regex: regex } },
      ],
    });
  }

  // ── Exact enum filters ────────────────────────────────────────────
  if (query.status)     conditions.push({ status: query.status });
  if (query.source)     conditions.push({ source: query.source });
  if (query.assignedTo) conditions.push({ assignedTo: query.assignedTo });

  // ── Company substring filter ──────────────────────────────────────
  if (query.company?.trim()) {
    const escaped = query.company.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    conditions.push({ company: { $regex: new RegExp(escaped, 'i') } });
  }

  // ── Date range ────────────────────────────────────────────────────
  if (query.startDate ?? query.endDate) {
    const dateRange: { $gte?: Date; $lte?: Date } = {};
    if (query.startDate) {
      const d = new Date(query.startDate);
      if (!isNaN(d.getTime())) dateRange.$gte = d;
    }
    if (query.endDate) {
      const d = new Date(query.endDate);
      if (!isNaN(d.getTime())) dateRange.$lte = d;
    }
    if (dateRange.$gte ?? dateRange.$lte) {
      conditions.push({ createdAt: dateRange });
    }
  }

  // ── Combine all conditions with $and ──────────────────────────────
  // $and is MongoDB's default when you pass multiple fields on the same object,
  // but explicit $and ensures correct behaviour when $or is mixed in.
  if (conditions.length === 0)  return {};
  if (conditions.length === 1)  return conditions[0]!;
  return { $and: conditions };
};

// ── findAll ────────────────────────────────────────────────────────

/**
 * findAllLeads — list + filter + search + sort + paginate.
 *
 * Accepts the fully-validated LeadsQueryInput from Zod (already parsed
 * by the validate() middleware), so no re-parsing needed here.
 *
 * Execution plan:
 *   1. Build filter from query params
 *   2. Run find() and countDocuments() in parallel (Promise.all)
 *   3. Return paginated result with metadata
 */
export const findAllLeads = async (
  query: LeadsQueryInput
): Promise<PaginatedResult<ILead>> => {
  const pagination: PaginationOptions = {
    page:      query.page,
    limit:     query.limit,
    sortBy:    query.sortBy ?? 'createdAt',
    sortOrder: query.sortOrder ?? 'desc',
  };

  const filter = buildLeadFilter(query);
  const sort   = buildSortObject(pagination);
  const skip   = calcSkip(pagination.page, pagination.limit);

  const [data, total] = await Promise.all([
    Lead.find(filter).sort(sort).skip(skip).limit(pagination.limit).lean(),
    Lead.countDocuments(filter),
  ]);

  return buildPaginatedResult(data as unknown as ILead[], total, pagination.page, pagination.limit);
};

// ── exportToCSV ────────────────────────────────────────────────────

/**
 * exportLeadsToCSV
 * Generates a CSV string containing all leads matching the current filters.
 * Ignores pagination boundaries to export the full dataset.
 */
export const exportLeadsToCSV = async (query: LeadsQueryInput): Promise<string> => {
  const filter = buildLeadFilter(query);
  const sort = buildSortObject({
    sortBy: query.sortBy ?? 'createdAt',
    sortOrder: query.sortOrder ?? 'desc',
    page: 1, limit: 10
  });

  // Fetch all matching records natively
  const leads = await Lead.find(filter).sort(sort).lean();

  // CSV Headers
  const headers = ['Name', 'Email', 'Status', 'Source', 'Created At'];
  
  // CSV Row builder with escaping
  const escapeCSV = (val: string | undefined | null) => {
    if (!val) return '""';
    const stringVal = String(val);
    if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
      return `"${stringVal.replace(/"/g, '""')}"`;
    }
    return stringVal;
  };

  const rows = leads.map((lead) => {
    return [
      escapeCSV(lead.name),
      escapeCSV(lead.email),
      escapeCSV(lead.status),
      escapeCSV(lead.source),
      escapeCSV(lead.createdAt ? new Date(lead.createdAt).toISOString() : ''),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
};

// ── findById ───────────────────────────────────────────────────────

export const findLeadById = async (id: string): Promise<ILead> => {
  if (!isValidObjectId(id)) {
    throw AppError.badRequest('Invalid lead ID format', 'INVALID_ID');
  }

  const lead = await Lead.findById(id).lean();
  if (!lead) throw AppError.notFound('Lead');

  return lead as unknown as ILead;
};

// ── create ─────────────────────────────────────────────────────────

export const createLead = async (input: CreateLeadInput): Promise<ILead> => {
  const lead = await Lead.create(input);
  return lead.toJSON() as unknown as ILead;
};

// ── update ─────────────────────────────────────────────────────────

export const updateLead = async (
  id: string,
  input: UpdateLeadInput
): Promise<ILead> => {
  if (!isValidObjectId(id)) {
    throw AppError.badRequest('Invalid lead ID format', 'INVALID_ID');
  }

  const lead = await Lead.findByIdAndUpdate(
    id,
    { $set: input },
    { new: true, runValidators: true, lean: true }
  );

  if (!lead) throw AppError.notFound('Lead');
  return lead as unknown as ILead;
};

// ── delete ─────────────────────────────────────────────────────────

export const deleteLead = async (id: string): Promise<void> => {
  if (!isValidObjectId(id)) {
    throw AppError.badRequest('Invalid lead ID format', 'INVALID_ID');
  }

  const result = await Lead.findByIdAndDelete(id);
  if (!result) throw AppError.notFound('Lead');
};

// ── bulkDelete ──────────────────────────────────────────────────────

export const bulkDeleteLeads = async (ids: string[]): Promise<number> => {
  const validIds = ids.filter(isValidObjectId);
  if (validIds.length === 0) {
    throw AppError.badRequest('No valid IDs provided');
  }

  const result = await Lead.deleteMany({ _id: { $in: validIds } });
  return result.deletedCount;
};

// ── getStats ───────────────────────────────────────────────────────

/**
 * Returns pipeline counts by status for the dashboard overview card.
 * Used by GET /api/v1/leads/stats
 */
export const getLeadStats = async () => {
  const [statusStats, sourceStats, totalCount] = await Promise.all([
    Lead.aggregate<{ _id: string; count: number }>([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort:  { _id: 1 } },
    ]),
    Lead.aggregate<{ _id: string; count: number }>([
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort:  { _id: 1 } },
    ]),
    Lead.countDocuments(),
  ]);

  const byStatus = statusStats.reduce<Record<string, number>>((acc, { _id, count }) => {
    acc[_id] = count;
    return acc;
  }, {});

  const bySource = sourceStats.reduce<Record<string, number>>((acc, { _id, count }) => {
    acc[_id] = count;
    return acc;
  }, {});

  return {
    total: totalCount,
    byStatus,
    bySource,
  };
};
