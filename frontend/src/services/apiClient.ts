import axios from 'axios';
import { useAuthStore } from '@store/authStore';

// ── Client instance ────────────────────────────────────────────────

export const apiClient = axios.create({
  baseURL:         '/api',
  timeout:         15_000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: inject access token ──────────────────────

apiClient.interceptors.request.use(
  (config) => {
    // Read token directly from Zustand store (no hook — we're outside React)
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error)
);

// ── Response interceptor: handle 401 + normalize errors ──────────

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token);
    else reject(error);
  });
  pendingQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,

  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    const originalRequest = error.config;
    const status = error.response?.status;
    const code   = (error.response?.data as { code?: string } | undefined)?.code;

    // ── 401 + expired token — attempt silent refresh ──────────────
    if (
      status === 401 &&
      code === 'TOKEN_EXPIRED' &&
      originalRequest &&
      !(originalRequest as typeof originalRequest & { _retry?: boolean })._retry
    ) {
      (originalRequest as typeof originalRequest & { _retry?: boolean })._retry = true;

      if (isRefreshing) {
        // Queue subsequent calls while a refresh is already in-flight
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: (newToken) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
              }
              resolve(apiClient(originalRequest));
            },
            reject,
          });
        });
      }

      isRefreshing = true;
      const refreshToken = useAuthStore.getState().refreshToken;

      if (!refreshToken) {
        useAuthStore.getState().logout();
        window.location.replace('/login');
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post<{
          data: { accessToken: string; refreshToken: string; expiresIn: string };
        }>('/api/v1/auth/refresh', { refreshToken });

        const { accessToken, refreshToken: newRefresh } = data.data;

        // Patch the store with new tokens (no full setAuth — avoid user refetch)
        useAuthStore.setState({
          accessToken:  accessToken,
          refreshToken: newRefresh,
        });

        processQueue(null, accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        window.location.replace('/login');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ── Any other 401 — session invalid, force logout ─────────────
    if (status === 401) {
      useAuthStore.getState().logout();
      window.location.replace('/login');
    }

    // ── Normalize error message ───────────────────────────────────
    const message =
      (error.response?.data as { message?: string } | undefined)?.message ??
      error.message ??
      'An unexpected error occurred';

    return Promise.reject(new Error(message));
  }
);
