// ── User domain ───────────────────────────────────────────────────

export type UserRole = 'admin' | 'sales_user';

export interface AuthUser {
  id:        string;
  name:      string;
  email:     string;
  role:      UserRole;
  isActive:  boolean;
  createdAt: string;
}

// ── Token shapes ──────────────────────────────────────────────────

export interface AuthTokens {
  accessToken:  string;
  refreshToken: string;
  expiresIn:    string;
}

// ── API response wrappers ─────────────────────────────────────────

export interface AuthResponse {
  user:   AuthUser;
  tokens: AuthTokens;
}

// ── Form input types ──────────────────────────────────────────────

export interface LoginFormValues {
  email:    string;
  password: string;
}

export interface RegisterFormValues {
  name:            string;
  email:           string;
  password:        string;
  confirmPassword: string;
  role?:           UserRole;
}

// ── API response envelope (mirrors backend) ───────────────────────

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data:    T;
}

export interface ApiErrorResponse {
  success:    false;
  message:    string;
  code:       string;
  statusCode: number;
  errors?:    Record<string, string[]>;
}
