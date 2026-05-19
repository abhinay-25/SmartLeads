import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import type { AuthUser, AuthTokens } from '@/types/auth.types';

// ── State shape ───────────────────────────────────────────────────

interface AuthState {
  // State
  user:            AuthUser | null;
  accessToken:     string | null;
  refreshToken:    string | null;
  isAuthenticated: boolean;
  isHydrated:      boolean;      // true once persist rehydration completes

  // Actions
  setAuth:       (user: AuthUser, tokens: AuthTokens) => void;
  setHydrated:   (v: boolean) => void;
  logout:        () => void;
  updateUser:    (user: Partial<AuthUser>) => void;
}

// ── Store ─────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // ── Initial state ─────────────────────────────────────────
        user:            null,
        accessToken:     null,
        refreshToken:    null,
        isAuthenticated: false,
        isHydrated:      false,

        // ── Actions ───────────────────────────────────────────────

        /**
         * Called after successful login or register.
         * Stores both tokens — accessToken injected into Axios headers,
         * refreshToken stored for silent refresh flow.
         */
        setAuth: (user, tokens) =>
          set(
            {
              user,
              accessToken:     tokens.accessToken,
              refreshToken:    tokens.refreshToken,
              isAuthenticated: true,
            },
            false,
            'auth/setAuth'
          ),

        /** Marks the store as rehydrated — prevents flash of redirect on page load */
        setHydrated: (v) => set({ isHydrated: v }, false, 'auth/setHydrated'),

        /** Clears all auth state — called on logout or 401 */
        logout: () =>
          set(
            {
              user:            null,
              accessToken:     null,
              refreshToken:    null,
              isAuthenticated: false,
            },
            false,
            'auth/logout'
          ),

        /** Partial user update — for profile changes without re-login */
        updateUser: (partial) => {
          const current = get().user;
          if (!current) return;
          set({ user: { ...current, ...partial } }, false, 'auth/updateUser');
        },
      }),
      {
        name: 'smart-leads-auth',
        storage: createJSONStorage(() => localStorage),
        // Only persist tokens + user — not ephemeral flags
        partialize: (state) => ({
          user:         state.user,
          accessToken:  state.accessToken,
          refreshToken: state.refreshToken,
        }),
        // After rehydration — mark the store as ready
        onRehydrateStorage: () => (state) => {
          state?.setHydrated(true);
          // Restore isAuthenticated from persisted token
          if (state?.accessToken) {
            state.isAuthenticated = true;
          }
        },
      }
    ),
    { name: 'auth-store' }
  )
);

// ── Typed selectors (stable references — prevents unnecessary re-renders) ──

export const selectUser             = (s: AuthState) => s.user;
export const selectAccessToken      = (s: AuthState) => s.accessToken;
export const selectIsAuthenticated  = (s: AuthState) => s.isAuthenticated;
export const selectIsHydrated       = (s: AuthState) => s.isHydrated;
