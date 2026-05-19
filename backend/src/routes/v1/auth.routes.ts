import { Router } from 'express';
import * as authController from '@controllers/auth.controller';
import { validate } from '@middleware/validate.middleware';
import { authenticate } from '@middleware/auth.middleware';
import { authRateLimiter } from '@middleware/rateLimiter.middleware';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
} from '@validators/auth.validator';

/**
 * Auth router — /api/v1/auth
 *
 * Public routes (no token required):
 *   POST /register         — create account
 *   POST /login            — get tokens
 *   POST /refresh          — exchange refresh token for new pair
 *   POST /logout           — stateless logout signal
 *
 * Protected routes (valid access token required):
 *   GET  /me               — current user profile
 *   PATCH /change-password — change own password
 */

const authRouter = Router();

// ── Public ────────────────────────────────────────────────────────
authRouter.post('/register', authRateLimiter, validate(registerSchema),      authController.register);
authRouter.post('/login',    authRateLimiter, validate(loginSchema),         authController.login);
authRouter.post('/refresh',  validate(refreshTokenSchema),                   authController.refresh);
authRouter.post('/logout',                                                   authController.logout);

// ── Protected (requires valid access token) ───────────────────────
authRouter.get('/me', authenticate, authController.getMe);
authRouter.patch(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword
);

export { authRouter };
