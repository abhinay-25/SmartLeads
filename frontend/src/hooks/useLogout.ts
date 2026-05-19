import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '@store/authStore';
import { logoutApi } from '@services/auth.service';

/**
 * useLogout — handles the full logout flow:
 * 1. Calls backend /logout (for future token blocklist support)
 * 2. Clears Zustand auth state (which wipes localStorage via persist)
 * 3. Navigates to /login
 *
 * Used in the Sidebar and any user menu.
 */
export const useLogout = () => {
  const navigate = useNavigate();
  const logout   = useAuthStore((s) => s.logout);

  const handleLogout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // Non-critical — proceed with local logout even if server call fails
    } finally {
      logout();
      toast.success('You have been signed out.');
      navigate('/login', { replace: true });
    }
  }, [logout, navigate]);

  return { logout: handleLogout };
};
