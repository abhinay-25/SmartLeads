import { z } from 'zod';

// ── Registration schema ───────────────────────────────────────────

/**
 * Validates the request body for POST /api/v1/auth/register.
 *
 * Password rules (NIST SP 800-63B aligned):
 * - Minimum 8 characters
 * - At least one uppercase, one lowercase, one digit, one special char
 * - Maximum 72 characters (bcrypt silently truncates beyond 72 bytes)
 */
export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be 100 characters or less'),

    email: z
      .string()
      .email('Invalid email address')
      .toLowerCase()
      .max(255, 'Email too long'),

    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password must be 72 characters or less')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),

    confirmPassword: z.string(),

    role: z
      .enum(['admin', 'sales_user'])
      .optional()
      .default('sales_user'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ── Login schema ──────────────────────────────────────────────────

/**
 * Validates the request body for POST /api/v1/auth/login.
 * Kept intentionally minimal — never reveal which field is wrong.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email or password')   // vague error on purpose — no user enumeration
    .toLowerCase(),

  password: z
    .string()
    .min(1, 'Invalid email or password'),  // vague on purpose
});

// ── Refresh token schema ──────────────────────────────────────────

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// ── Change password schema ────────────────────────────────────────

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(72)
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must differ from current password',
    path: ['newPassword'],
  });

// ── Inferred types ────────────────────────────────────────────────

export type RegisterInput      = z.infer<typeof registerSchema>;
export type LoginInput         = z.infer<typeof loginSchema>;
export type RefreshTokenInput  = z.infer<typeof refreshTokenSchema>;
export type ChangePasswordInput= z.infer<typeof changePasswordSchema>;
