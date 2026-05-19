import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '@utils/AppError';
import { extractBearerToken, verifyAccessToken } from '@utils/token';
import type { UserRole } from '../types/index';

// ─────────────────────────────────────────────────────────────────
// Authentication Middleware
// Verifies the JWT access token and attaches the decoded user
// payload to req.user for use in downstream handlers.
// ─────────────────────────────────────────────────────────────────

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  // 1. Extract token from Authorization: Bearer <token>
  const token = extractBearerToken(req.headers['authorization']);

  if (!token) {
    next(AppError.unauthorized(
      'Authentication required. Provide a Bearer token.',
      'MISSING_TOKEN'
    ));
    return;
  }

  // 2. Verify signature + expiry
  try {
    const payload = verifyAccessToken(token);

    // 3. Attach to req.user — typed via global Express augmentation
    req.user = {
      id:    payload.sub,
      name:  payload.name,
      email: payload.email,
      role:  payload.role,
    };

    next();
  } catch (err) {
    // Distinguish expired tokens from tampered ones — useful for client UX
    if (err instanceof jwt.TokenExpiredError) {
      next(AppError.unauthorized('Access token has expired', 'TOKEN_EXPIRED'));
      return;
    }

    if (err instanceof jwt.JsonWebTokenError) {
      next(AppError.unauthorized('Invalid access token', 'INVALID_TOKEN'));
      return;
    }

    // Unknown JWT error — treat as unauthorized
    next(AppError.unauthorized());
  }
};

// ─────────────────────────────────────────────────────────────────
// Authorization Middleware (RBAC)
// Must be used AFTER authenticate — req.user is guaranteed to exist.
//
// Usage:
//   router.delete('/:id', authenticate, authorize('admin'), controller.delete);
//   router.get('/',       authenticate, authorize('admin', 'sales_user'), controller.list);
// ─────────────────────────────────────────────────────────────────

export const authorize = (...roles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(AppError.unauthorized('Authentication required', 'MISSING_AUTH'));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(AppError.forbidden(
        `Access denied. Requires one of: [${roles.join(', ')}]`,
        'INSUFFICIENT_ROLE'
      ));
      return;
    }

    next();
  };

// ─────────────────────────────────────────────────────────────────
// Optional auth — attaches user if token present, continues if not.
// Use for routes that have different behavior for auth vs. anon users.
// ─────────────────────────────────────────────────────────────────

export const optionalAuthenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const token = extractBearerToken(req.headers['authorization']);

  if (!token) {
    next();
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id:    payload.sub,
      name:  payload.name,
      email: payload.email,
      role:  payload.role,
    };
  } catch {
    // Silently ignore invalid tokens — route continues without req.user
  }

  next();
};
