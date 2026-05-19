import { useEffect } from 'react';
import { useAuthStore } from '@store/authStore';
import { getMeApi } from '@services/auth.service';

/**
 * useAuthHydration — silently validates the persisted token on app startup.
 *
 * Flow:
 * 1. Zustand persist rehydrates from localStorage synchronously
 * 2. isHydrated is set to true immediately by onRehydrateStorage
 * 3. This hook calls /me to confirm the token is still valid on the server
 * 4. If /me fails (401), Axios interceptor clears state and redirects
 *
 * This prevents stale sessions from appearing valid after:
 * - Server-side logout / account deactivation
 * - Token invalidation (Phase 5 blocklist)
 */
export const useAuthHydration = () => {
  const { accessToken, isAuthenticated, setAuth, logout } = useAuthStore();

  useEffect(() => {
    // No token — nothing to hydrate
    if (!accessToken || !isAuthenticated) return;

    // Silently verify token is still valid with the server
    getMeApi()
      .then((user) => {
        // Token is valid — update user data in case profile changed
        useAuthStore.setState((s) => ({ user: { ...s.user!, ...user } }));
      })
      .catch(() => {
        // /me returned 401 or network error — Axios interceptor handles redirect
        // Fallback: clear local state
        logout();
      });
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Suppress unused var warning — intentional pattern
  void setAuth;
};
