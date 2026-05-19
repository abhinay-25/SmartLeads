import type { Response } from 'express';
import type { PaginatedResult } from '../types/index';

// ── Response envelope shapes ─────────────────────────────────────

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiPaginatedResponse<T> {
  success: true;
  message: string;
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ── Core response senders ─────────────────────────────────────────

/**
 * Standard 200 success response.
 *
 * @example sendSuccess(res, lead, 'Lead retrieved');
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200
): Response<ApiSuccessResponse<T>> => {
  return res.status(statusCode).json({ success: true, message, data });
};

/**
 * 201 Created response.
 *
 * @example sendCreated(res, newLead, 'Lead created');
 */
export const sendCreated = <T>(
  res: Response,
  data: T,
  message = 'Created successfully'
): Response<ApiSuccessResponse<T>> => sendSuccess(res, data, message, 201);

/**
 * 204 No Content — for DELETE operations.
 *
 * @example sendNoContent(res);
 */
export const sendNoContent = (res: Response): Response => res.status(204).send();

/**
 * Paginated list response — attaches meta to envelope root.
 *
 * @example sendPaginated(res, leads, meta, 'Leads retrieved');
 */
export const sendPaginated = <T>(
  res: Response,
  result: PaginatedResult<T>,
  message = 'Success'
): Response<ApiPaginatedResponse<T>> => {
  const meta: PaginationMeta = {
    total:      result.total,
    page:       result.page,
    perPage:    result.limit,
    totalPages: result.totalPages,
    hasNext:    result.hasNext,
    hasPrev:    result.hasPrev,
  };

  return res.status(200).json({ success: true, message, data: result.data, meta });
};

// ── Pagination builder ────────────────────────────────────────────

/**
 * Builds a PaginatedResult from raw Mongoose countDocuments + find results.
 *
 * @example
 * const [data, total] = await Promise.all([
 *   Lead.find(filter).skip(skip).limit(limit),
 *   Lead.countDocuments(filter),
 * ]);
 * return buildPaginatedResult(data, total, page, limit);
 */
export const buildPaginatedResult = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResult<T> => ({
  data,
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
  hasNext: page * limit < total,
  hasPrev: page > 1,
});
