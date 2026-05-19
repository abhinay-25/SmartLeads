import type { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps an async route handler and forwards any thrown errors to Express
 * error middleware — eliminating try/catch boilerplate in every controller.
 *
 * Works alongside `express-async-errors` as a belt-and-suspenders approach.
 *
 * @example
 * router.get('/', asyncHandler(async (req, res) => {
 *   const leads = await leadService.findAll();
 *   sendSuccess(res, leads);
 * }));
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
