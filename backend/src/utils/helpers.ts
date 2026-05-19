import mongoose from 'mongoose';

/**
 * Returns true when `id` is a valid MongoDB ObjectId string.
 * Use in services to throw AppError.notFound() early before hitting the DB.
 *
 * @example
 * if (!isValidObjectId(req.params.id)) throw AppError.badRequest('Invalid ID format');
 */
export const isValidObjectId = (id: string): boolean =>
  mongoose.Types.ObjectId.isValid(id);

/**
 * Strips `undefined` values from an object — useful when building partial
 * update payloads so Mongoose $set doesn't overwrite fields with undefined.
 *
 * @example
 * const updateData = omitUndefined({ name: body.name, phone: body.phone });
 */
export const omitUndefined = <T extends Record<string, unknown>>(
  obj: T
): Partial<T> => {
  const result: Partial<T> = {};
  for (const key of Object.keys(obj) as Array<keyof T>) {
    if (obj[key] !== undefined) result[key] = obj[key];
  }
  return result;
};

/**
 * Converts a comma-separated string to an array of trimmed strings.
 * Useful for parsing query param arrays: ?fields=name,email,company
 */
export const parseCommaSeparated = (value: unknown): string[] => {
  if (typeof value !== 'string' || value.trim() === '') return [];
  return value.split(',').map((s) => s.trim()).filter(Boolean);
};

/**
 * Picks specific keys from an object — useful for projections.
 */
export const pick = <T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach((k) => { result[k] = obj[k]; });
  return result;
};
