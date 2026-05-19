import type { Request, Response, NextFunction } from 'express';
import { AppError } from '@utils/AppError';
import { logger } from '@utils/logger';

/**
 * Attaches a unique request ID to each incoming request for log correlation.
 * In production, use a proper UUID library (e.g., `uuid` package).
 */
export const requestIdMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const requestId = `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  req.headers['x-request-id'] = requestId;
  next();
};

/**
 * Structured request logger — logs method, URL, status code, and duration.
 * In production this replaces morgan for structured JSON logging.
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();
  const requestId = req.headers['x-request-id'];

  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 500 ? 'error'
                : res.statusCode >= 400 ? 'warn'
                : 'info';

    logger[level](`${req.method} ${req.originalUrl}`, {
      requestId,
      status:     res.statusCode,
      duration:   `${duration}ms`,
      ip:         req.ip,
      userAgent:  req.headers['user-agent'],
    });
  });

  next();
};

/**
 * 404 handler — catches any request that didn't match a route.
 * Must be registered AFTER all routes and BEFORE the error handler.
 */
export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  next(
    new AppError(
      `Route ${req.method} ${req.originalUrl} not found`,
      404,
      'NOT_FOUND'
    )
  );
};
