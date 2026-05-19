import { User } from '@models/user.model';
import type { IUser } from '@models/user.model';
import { AppError } from '@utils/AppError';
import { issueAuthTokens, verifyRefreshToken } from '@utils/token';
import type { AuthTokens } from '@utils/token';
import type { RegisterInput, LoginInput } from '@validators/auth.validator';
import { logger } from '@utils/logger';

// ── Public DTOs (what we send to the client) ─────────────────────

export interface AuthUser {
  id:        string;
  name:      string;
  email:     string;
  role:      IUser['role'];
  isActive:  boolean;
  createdAt: Date;
}

export interface AuthResponse {
  user:   AuthUser;
  tokens: AuthTokens;
}

// ── Internal helpers ──────────────────────────────────────────────

/**
 * Converts an IUser document to a safe public DTO.
 * Password is never included — this is a belt-and-suspenders check
 * on top of select:false in the schema.
 */
const toAuthUser = (user: IUser): AuthUser => ({
  id:        (user._id as object).toString(),
  name:      user.name,
  email:     user.email,
  role:      user.role,
  isActive:  user.isActive,
  createdAt: user.createdAt,
});

const buildTokenPayload = (user: IUser) => ({
  sub:   (user._id as object).toString(),
  email: user.email,
  role:  user.role,
  name:  user.name,
});

// ── register ──────────────────────────────────────────────────────

/**
 * Creates a new user account.
 *
 * Security notes:
 * - Checks for duplicate email BEFORE hashing (saves CPU)
 * - bcrypt hashing happens in the pre-save hook (model layer)
 * - confirmPassword is stripped from the DB write — never stored
 * - Returns tokens immediately so the client is logged in after signup
 */
export const register = async (input: RegisterInput): Promise<AuthResponse> => {
  // 1. Check for existing user — do this BEFORE creating to avoid unnecessary bcrypt work
  const existing = await User.findOne({ email: input.email });
  if (existing) {
    throw AppError.conflict('An account with this email already exists', 'EMAIL_TAKEN');
  }

  // 2. Create user — password is hashed in the pre-save hook
  const { confirmPassword: _, ...userData } = input;
  const user = await User.create(userData);

  logger.info('New user registered', { userId: (user._id as object).toString(), role: user.role });

  // 3. Issue tokens
  const tokens = issueAuthTokens(buildTokenPayload(user));

  return { user: toAuthUser(user), tokens };
};

// ── login ─────────────────────────────────────────────────────────

/**
 * Authenticates a user by email + password.
 *
 * Security notes:
 * - Generic error message — never reveal whether the email exists (user enumeration)
 * - Uses `select('+password')` to explicitly retrieve the excluded field
 * - comparePassword uses bcrypt.compare (constant-time)
 * - Updates lastLogin timestamp on success
 */
export const login = async (input: LoginInput): Promise<AuthResponse> => {
  // 1. Find user and explicitly select password (excluded by default via select:false)
  const user = await User.findOne({ email: input.email }).select('+password');

  // 2. Generic "invalid credentials" for both not-found AND wrong password
  //    This prevents user enumeration attacks.
  const INVALID_MSG = 'Invalid email or password';

  if (!user) {
    throw AppError.unauthorized(INVALID_MSG, 'INVALID_CREDENTIALS');
  }

  if (!user.isActive) {
    throw AppError.forbidden('Your account has been deactivated. Contact support.', 'ACCOUNT_DISABLED');
  }

  // 3. Constant-time password comparison
  const isMatch = await user.comparePassword(input.password);
  if (!isMatch) {
    throw AppError.unauthorized(INVALID_MSG, 'INVALID_CREDENTIALS');
  }

  // 4. Update lastLogin (non-blocking — don't await)
  void User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

  logger.info('User logged in', { userId: (user._id as object).toString() });

  // 5. Issue tokens
  const tokens = issueAuthTokens(buildTokenPayload(user));

  return { user: toAuthUser(user), tokens };
};

// ── refreshTokens ─────────────────────────────────────────────────

/**
 * Validates a refresh token and issues a fresh access + refresh token pair.
 *
 * Rotation strategy: issue a new refresh token on every refresh.
 * This limits the damage if a refresh token is stolen — the old one
 * becomes invalid after the first use in a proper rotation store.
 *
 * Phase 5: Implement refresh token rotation with a Redis/DB blocklist.
 */
export const refreshTokens = async (refreshToken: string): Promise<AuthTokens> => {
  let payload: { sub: string };

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw AppError.unauthorized('Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN');
  }

  // Fetch the user to confirm they still exist and are active
  const user = await User.findById(payload.sub);
  if (!user) {
    throw AppError.unauthorized('User no longer exists', 'USER_NOT_FOUND');
  }

  if (!user.isActive) {
    throw AppError.forbidden('Account deactivated', 'ACCOUNT_DISABLED');
  }

  return issueAuthTokens(buildTokenPayload(user));
};

// ── getMe ─────────────────────────────────────────────────────────

/**
 * Returns the currently authenticated user's public profile.
 * Called by GET /api/v1/auth/me — requires authenticate middleware.
 */
export const getMe = async (userId: string): Promise<AuthUser> => {
  const user = await User.findById(userId);
  if (!user) {
    throw AppError.notFound('User');
  }

  return toAuthUser(user);
};

// ── changePassword ────────────────────────────────────────────────

/**
 * Allows an authenticated user to change their own password.
 * Verifies the current password first — prevents privilege escalation
 * if a session is hijacked without knowing the original password.
 */
export const changePassword = async (
  userId:          string,
  currentPassword: string,
  newPassword:     string
): Promise<void> => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw AppError.notFound('User');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw AppError.unauthorized('Current password is incorrect', 'INVALID_CREDENTIALS');
  }

  user.password = newPassword;  // pre-save hook hashes it
  await user.save();

  logger.info('User changed password', { userId });
};
