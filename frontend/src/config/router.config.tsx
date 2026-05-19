import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { DashboardLayout } from '@layouts/DashboardLayout';
import { AuthLayout }      from '@layouts/AuthLayout';
import { PageLoader }      from '@components/ui/PageLoader';
import { useAuthStore, selectIsAuthenticated, selectIsHydrated } from '@store/authStore';

// ── Lazy pages ────────────────────────────────────────────────────
const DashboardPage = lazy(() => import('@pages/Dashboard/DashboardPage'));
const LeadsPage     = lazy(() => import('@pages/Leads/LeadsPage'));
const SettingsPage  = lazy(() => import('@pages/Settings/SettingsPage'));
const NotFoundPage  = lazy(() => import('@pages/NotFound/NotFoundPage'));
const LoginPage     = lazy(() =>
  import('@pages/Auth/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const RegisterPage  = lazy(() =>
  import('@pages/Auth/RegisterPage').then((m) => ({ default: m.RegisterPage }))
);
const UnauthorizedPage = lazy(() => import('@pages/Error/UnauthorizedPage'));

// ── Suspense wrapper ──────────────────────────────────────────────
const SuspensePage = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

// ── Protected route guard ─────────────────────────────────────────
/**
 * ProtectedLayout handles authentication.
 * Optional permission checks can be passed as a prop if we wrap it later,
 * but for now it just ensures the user is logged in.
 */
const ProtectedLayout = () => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isHydrated      = useAuthStore(selectIsHydrated);

  if (!isHydrated) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Outlet />;
};

// ── Public route guard (redirect to dashboard if logged in) ───────
const PublicOnlyLayout = () => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isHydrated      = useAuthStore(selectIsHydrated);

  if (!isHydrated) return <PageLoader />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
};

// ── Router ────────────────────────────────────────────────────────
export const router = createBrowserRouter([
  // Root redirect
  { index: true, path: '/', element: <Navigate to="/dashboard" replace /> },

  // ── Auth routes (public only — redirect to dashboard if logged in)
  {
    element: <PublicOnlyLayout />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: 'login',
            element: <SuspensePage><LoginPage /></SuspensePage>,
          },
          {
            path: 'register',
            element: <SuspensePage><RegisterPage /></SuspensePage>,
          },
        ],
      },
    ],
  },

  // ── Protected dashboard routes
  {
    element: <ProtectedLayout />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: 'dashboard',
            element: <SuspensePage><DashboardPage /></SuspensePage>,
          },
          {
            path: 'leads',
            element: <SuspensePage><LeadsPage /></SuspensePage>,
          },
          {
            path: 'settings',
            element: <SuspensePage><SettingsPage /></SuspensePage>,
          },
        ],
      },
    ],
  },

  // ── Unauthorized route
  {
    path: 'unauthorized',
    element: <SuspensePage><UnauthorizedPage /></SuspensePage>,
  },

  // 404
  { path: '*', element: <SuspensePage><NotFoundPage /></SuspensePage> },
]);
