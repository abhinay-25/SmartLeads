import { apiClient } from './apiClient';
import type {
  AuthResponse,
  AuthUser,
  AuthTokens,
  ApiSuccessResponse,
  LoginFormValues,
  RegisterFormValues,
} from '@/types/auth.types';

// ── API response shapes ────────────────────────────────────────────

type AuthApiResponse      = ApiSuccessResponse<AuthResponse>;
type MeApiResponse        = ApiSuccessResponse<AuthUser>;
type TokensApiResponse    = ApiSuccessResponse<AuthTokens>;
type MessageApiResponse   = ApiSuccessResponse<null>;

// ── Auth service ──────────────────────────────────────────────────

/**
 * POST /api/v1/auth/login
 */
export const loginApi = async (data: LoginFormValues): Promise<AuthResponse> => {
  const res = await apiClient.post<AuthApiResponse>('/v1/auth/login', data);
  return res.data.data;
};

/**
 * POST /api/v1/auth/register
 */
export const registerApi = async (data: RegisterFormValues): Promise<AuthResponse> => {
  const res = await apiClient.post<AuthApiResponse>('/v1/auth/register', data);
  return res.data.data;
};

/**
 * GET /api/v1/auth/me
 * Fetches the current authenticated user's profile.
 * Used for hydration on page load.
 */
export const getMeApi = async (): Promise<AuthUser> => {
  const res = await apiClient.get<MeApiResponse>('/v1/auth/me');
  return res.data.data;
};

/**
 * POST /api/v1/auth/refresh
 * Exchanges a refresh token for a new access + refresh token pair.
 */
export const refreshTokensApi = async (refreshToken: string): Promise<AuthTokens> => {
  const res = await apiClient.post<TokensApiResponse>('/v1/auth/refresh', { refreshToken });
  return res.data.data;
};

/**
 * POST /api/v1/auth/logout
 * Signals logout to the server (for future token blocklist support).
 */
export const logoutApi = async (): Promise<void> => {
  await apiClient.post<MessageApiResponse>('/v1/auth/logout');
};

/**
 * PATCH /api/v1/auth/change-password
 */
export const changePasswordApi = async (payload: {
  currentPassword:    string;
  newPassword:        string;
  confirmNewPassword: string;
}): Promise<void> => {
  await apiClient.patch<MessageApiResponse>('/v1/auth/change-password', payload);
};
