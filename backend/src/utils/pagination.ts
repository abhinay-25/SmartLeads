import type { PaginationOptions } from '../types/index';

/**
 * Parses and normalises pagination + sort query params with safe defaults.
 * Call this at the top of any service method that returns a list.
 *
 * @example
 * const pagination = parsePaginationOptions(req.query);
 * const skip = (pagination.page - 1) * pagination.limit;
 */
export const parsePaginationOptions = (query: Record<string, unknown>): PaginationOptions => {
  const page   = Math.max(1, Number(query['page'])  || 1);
  const limit  = Math.min(100, Math.max(1, Number(query['limit']) || 20));
  const sortBy = typeof query['sortBy'] === 'string' ? query['sortBy'] : 'createdAt';
  const sortOrder = query['sortOrder'] === 'asc' ? 'asc' : 'desc';

  return { page, limit, sortBy, sortOrder };
};

/**
 * Converts pagination options to a Mongoose-compatible sort object.
 *
 * @example
 * Lead.find(filter).sort(buildSortObject(pagination));
 */
export const buildSortObject = (
  pagination: PaginationOptions
): Record<string, 1 | -1> => ({
  [pagination.sortBy]: pagination.sortOrder === 'asc' ? 1 : -1,
});

/**
 * Computes the number of documents to skip for a given page.
 */
export const calcSkip = (page: number, limit: number): number =>
  (page - 1) * limit;
