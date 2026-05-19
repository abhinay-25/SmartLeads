import type { Request, Response, NextFunction } from 'express';
import { AppError } from '@utils/AppError';
import { logger } from '@utils/logger';
import { env } from '@config/env.config';
import { ZodError } from 'zod';
import mongoose from 'mongoose';

interface ErrorResponse {
  success: false;
  message: string;
  code: string;
  statusCode: number;
  errors?: Record<string, string[]>;
  stack?: string;
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error('Error:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
  });

  // Known operational error
  if (err instanceof AppError) {
    const response: ErrorResponse = {
      success: false,
      message: err.message,
      code: err.code,
      statusCode: err.statusCode,
      ...(env.NODE_ENV === 'development' && err.stack ? { stack: err.stack } : {}),
    };

    res.status(err.statusCode).json(response);
    return;
  }

  // Zod validation error
  if (err instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    err.issues.forEach((e) => {
      const field = e.path.join('.');
      if (!errors[field]) errors[field] = [];
      errors[field]?.push(e.message);
    });

    res.status(422).json({
      success: false,
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      statusCode: 422,
      errors,
    });
    return;
  }

  // Mongoose validation error
  if (err instanceof mongoose.Error.ValidationError) {
    const errors: Record<string, string[]> = {};
    Object.values(err.errors).forEach((e) => {
      if (!errors[e.path]) errors[e.path] = [];
      errors[e.path]?.push(e.message);
    });

    res.status(422).json({
      success: false,
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      statusCode: 422,
      errors,
    });
    return;
  }

  // Mongoose duplicate key error
  if (err instanceof mongoose.mongo.MongoServerError && err.code === 11000) {
    res.status(409).json({
      success: false,
      message: 'A resource with this value already exists',
      code: 'DUPLICATE_KEY',
      statusCode: 409,
    });
    return;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({
      success: false,
      message: `Invalid value for field: ${err.path}`,
      code: 'INVALID_ID',
      statusCode: 400,
    });
    return;
  }

  // Unknown error — don't leak internals in production
  const response: ErrorResponse = {
    success: false,
    message: env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    code: 'INTERNAL_ERROR',
    statusCode: 500,
    ...(env.NODE_ENV === 'development' && err.stack ? { stack: err.stack } : {}),
  };

  res.status(500).json(response);
};
