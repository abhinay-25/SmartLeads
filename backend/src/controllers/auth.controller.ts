import type { Request, Response } from 'express';
import * as authService from '@services/auth.service';
import { asyncHandler } from '@utils/asyncHandler';
import { sendSuccess, sendCreated } from '@utils/apiResponse';
import type { RegisterInput, LoginInput, RefreshTokenInput, ChangePasswordInput } from '@validators/auth.validator';

// ─────────────────────────────────────────────────────────────────
// AuthController — thin HTTP adapter.
// All logic lives in authService.
// ─────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/register
 * Creates a new account and returns tokens immediately.
 * Body validated by validate(registerSchema) middleware.
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as RegisterInput;
  const result = await authService.register(input);
  sendCreated(res, result, 'Account created successfully');
});

/**
 * POST /api/v1/auth/login
 * Authenticates credentials and returns access + refresh tokens.
 * Body validated by validate(loginSchema) middleware.
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as LoginInput;
  const result = await authService.login(input);
  sendSuccess(res, result, 'Login successful');
});

/**
 * POST /api/v1/auth/refresh
 * Issues a new token pair from a valid refresh token.
 * Body validated by validate(refreshTokenSchema) middleware.
 */
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body as RefreshTokenInput;
  const tokens = await authService.refreshTokens(refreshToken);
  sendSuccess(res, tokens, 'Tokens refreshed successfully');
});

/**
 * GET /api/v1/auth/me
 * Returns the current authenticated user's profile.
 * Requires authenticate middleware.
 */
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  // req.user is guaranteed by authenticate middleware
  const user = await authService.getMe(req.user!.id);
  sendSuccess(res, user, 'Profile retrieved');
});

/**
 * PATCH /api/v1/auth/change-password
 * Allows authenticated user to change their password.
 * Requires authenticate middleware + validate(changePasswordSchema).
 */
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body as ChangePasswordInput;
  await authService.changePassword(req.user!.id, currentPassword, newPassword);
  sendSuccess(res, null, 'Password changed successfully');
});

/**
 * POST /api/v1/auth/logout
 * Stateless logout — client is responsible for discarding tokens.
 * Phase 5: Add token blocklist (Redis) to invalidate refresh tokens server-side.
 */
export const logout = asyncHandler(async (_req: Request, res: Response) => {
  // Stateless: no server-side action needed for access tokens
  // TODO Phase 5: blocklist the refresh token in Redis
  sendSuccess(res, null, 'Logged out successfully');
});
