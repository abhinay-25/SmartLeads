import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { env } from '@config/env.config';
import type { TokenPayload, UserRole } from '../types/index';

// ── Token shape returned to the client ───────────────────────────

export interface AuthTokens {
  accessToken:  string;
  refreshToken: string;
  expiresIn:    string;
}

// ── Shared sign options builder ───────────────────────────────────
// Cast expiresIn through unknown — env returns string, jwt expects StringValue
// (which is an opaque branded type from the `ms` package).
// This is the pragmatic workaround for the exact-optional-property-types + jwt v9 mismatch.

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const accessOptions = (): SignOptions => ({
  expiresIn: env.JWT_EXPIRES_IN,
  issuer:    'smart-leads',
  audience:  'smart-leads-client',
} as SignOptions);

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const refreshOptions = (): SignOptions => ({
  expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  issuer:    'smart-leads',
  audience:  'smart-leads-client',
} as SignOptions);

// ── Access token ──────────────────────────────────────────────────

/**
 * Signs a short-lived access token.
 * Contains: sub, email, role, name.
 *
 * Best practice: keep access tokens short-lived (15m in production).
 * The current default (7d) is developer-friendly — tighten in prod.
 */
export const signAccessToken = (payload: {
  sub:   string;
  email: string;
  role:  UserRole;
  name:  string;
}): string => jwt.sign(payload, env.JWT_SECRET, accessOptions());

/**
 * Signs a long-lived refresh token.
 * Contains only `sub` (userId) — minimal payload reduces exposure window.
 */
export const signRefreshToken = (userId: string): string =>
  jwt.sign({ sub: userId }, env.JWT_REFRESH_SECRET, refreshOptions());

/**
 * Creates and returns both access + refresh tokens together.
 * Call this at login and token-refresh endpoints.
 */
export const issueAuthTokens = (payload: {
  sub:   string;
  email: string;
  role:  UserRole;
  name:  string;
}): AuthTokens => ({
  accessToken:  signAccessToken(payload),
  refreshToken: signRefreshToken(payload.sub),
  expiresIn:    env.JWT_EXPIRES_IN,
});

// ── Token verification ────────────────────────────────────────────

/**
 * Verifies and decodes an access token.
 * Throws JsonWebTokenError | TokenExpiredError on failure — caught in middleware.
 */
export const verifyAccessToken = (token: string): TokenPayload =>
  jwt.verify(token, env.JWT_SECRET, {
    issuer:   'smart-leads',
    audience: 'smart-leads-client',
  }) as TokenPayload;

/**
 * Verifies and decodes a refresh token.
 */
export const verifyRefreshToken = (token: string): { sub: string } =>
  jwt.verify(token, env.JWT_REFRESH_SECRET, {
    issuer:   'smart-leads',
    audience: 'smart-leads-client',
  }) as { sub: string };

// ── Token extraction helper ───────────────────────────────────────

/**
 * Extracts the Bearer token from the Authorization header.
 * Returns null if the header is missing or malformed.
 */
export const extractBearerToken = (authHeader: string | undefined): string | null => {
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  return token.length > 0 ? token : null;
};
