import type { Document } from 'mongoose';

/**
 * Base interface for all Mongoose documents.
 * Extend this in every model interface to get consistent typing.
 *
 * @example
 * interface ILead extends BaseDocument {
 *   name: string;
 *   email: string;
 * }
 */
export interface BaseDocument extends Document {
  createdAt: Date;
  updatedAt: Date;
}
