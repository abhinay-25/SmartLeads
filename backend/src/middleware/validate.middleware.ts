import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from '@utils/AppError';

/**
 * Validation middleware factory.
 * Validates and transforms req.body | req.query | req.params using a Zod schema.
 * On failure, throws a ZodError which is caught by the central error handler.
 *
 * Usage:
 * router.post('/', validate(createLeadSchema), controller.create);
 * router.get('/',  validate(leadsQuerySchema, 'query'), controller.list);
 */

type ValidationTarget = 'body' | 'query' | 'params';

export const validate = (
  schema: z.ZodTypeAny,
  target: ValidationTarget = 'body'
) => (req: Request, _res: Response, next: NextFunction): void => {
  const result = schema.safeParse(req[target]);

  if (!result.success) {
    // Forward ZodError directly — the central error handler formats it
    next(result.error);
    return;
  }

  // Replace with parsed (and coerced/transformed) data
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  req[target] = result.data;
  next();
};

/**
 * Validate MongoDB ObjectId in req.params.id.
 * Throws a 400 AppError immediately without touching any service.
 *
 * Usage:
 * router.get('/:id', validateObjectId(), controller.getById);
 */
export const validateObjectId = (param = 'id') =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const id = req.params[param];
    if (!id || !/^[a-f\d]{24}$/i.test(id)) {
      next(AppError.badRequest(`Invalid ${param} format — must be a valid MongoDB ObjectId`, 'INVALID_ID'));
      return;
    }
    next();
  };
