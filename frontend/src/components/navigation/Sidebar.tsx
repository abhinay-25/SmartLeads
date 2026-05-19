import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Settings,
  ChevronLeft,
  Menu,
  X,
  LogOut,
  BarChart3,
  Bell,
  HelpCircle,
} from 'lucide-react';
import { useUIStore } from '@store/uiStore';
import { useAuthStore } from '@store/authStore';
import { useMediaQuery } from '@hooks/useMediaQuery';
import { useLogout } from '@hooks/useLogout';
import { cn } from '@lib/cn';
import { slideInLeftVariants } from '@lib/motion';
import { useEffect } from 'react';

/* ── Nav type ─────────────────────────────────────────────── */

interface NavItem {
  to:     string;
  icon:   React.ElementType;
  label:  string;
  badge?: string | number;
  adminOnly?: boolean;   // Phase 5: hide from sales_user if adminOnly
}

interface NavGroup {
  label:  string;
  items:  NavItem[];
}

/* ── Navigation structure ─────────────────────────────────── */

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Workspace',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/leads',     icon: Users,            label: 'Leads' },
    ],
  },
  {
    label: 'Insights',
    items: [
      {
        to:     '/reports',
        icon:   BarChart3,
        label:  'Reports',
        badge:  'Soon',     // Phase 6 placeholder
      },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/settings',      icon: Settings,    label: 'Settings' },
      { to: '/notifications', icon: Bell,        label: 'Notifications', adminOnly: true },
      { to: '/help',          icon: HelpCircle,  label: 'Help & Docs' },
    ],
  },
];

/* ── Nav Link Item ─────────────────────────────────────────── */

const SidebarNavItem = ({
  item,
  collapsed,
}: {
  item:      NavItem;
  collapsed: boolean;
}) => {
  const Icon    = item.icon;
  const isComingSoon = item.badge === 'Soon';

  if (isComingSoon) {
    return (
      <div
        title={collapsed ? item.label : undefined}
        className={cn(
          'group relative flex items-center gap-3 rounded-md px-2.5 py-2',
          'cursor-not-allowed opacity-50',
          'text-[hsl(var(--sidebar-text))]',
          collapsed && 'justify-center px-2'
        )}
      >
        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span
              key="label"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
              className="flex flex-1 items-center justify-between overflow-hidden whitespace-nowrap text-sm"
            >
              {item.label}
              <span className="ml-auto rounded-full bg-[hsl(var(--sidebar-active))] px-1.5 py-0.5 text-[0.5625rem] font-medium text-[hsl(var(--sidebar-text))]">
                Soon
              </span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <NavLink
      to={item.to}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 rounded-md px-2.5 py-2',
          'transition-colors duration-150',
          'text-[hsl(var(--sidebar-text))]',
          'hover:bg-[hsl(var(--sidebar-hover))] hover:text-white',
          isActive && 'bg-[hsl(var(--sidebar-active))] text-white font-medium',
          collapsed && 'justify-center px-2'
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* Active indicator bar */}
          {isActive && (
            <motion.div
              layoutId="sidebar-active-pill"
              className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full bg-white/90"
              transition={{ type: 'spring', stiffness: 420, damping: 38 }}
            />
          )}

          <Icon
            className={cn(
              'h-4 w-4 shrink-0 transition-colors',
              isActive ? 'text-white' : 'text-[hsl(var(--sidebar-text))]',
              'group-hover:text-white'
            )}
            aria-hidden="true"
          />

          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                key="label"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                className="flex flex-1 items-center overflow-hidden whitespace-nowrap text-sm"
              >
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Badge — shown only when expanded */}
          {item.badge !== undefined && item.badge !== 'Soon' && !collapsed && (
            <span className="ml-auto rounded-full bg-[hsl(var(--brand))] px-1.5 py-0.5 text-[0.6875rem] font-semibold text-white leading-none">
              {item.badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
};

/* ── Sidebar Section Label ─────────────────────────────────── */

const SidebarSection = ({
  label,
  collapsed,
}: {
  label:    string;
  collapsed: boolean;
}) => {
  if (collapsed) {
    return <div className="my-2 mx-2 h-px bg-[hsl(var(--sidebar-border))]" />;
  }
  return (
    <p className="mt-5 mb-1 px-2.5 text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-[hsl(220,12%,30%)]">
      {label}
    </p>
  );
};

/* ── Sidebar Content ───────────────────────────────────────── */

const SidebarContent = ({ collapsed }: { collapsed: boolean }) => {
  const { closeMobileSidebar } = useUIStore();
  const { logout }  = useLogout();
  const user        = useAuthStore((s) => s.user);
  const location    = useLocation();

  useEffect(() => {
    closeMobileSidebar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <div className="flex h-full flex-col bg-[hsl(var(--sidebar-bg))]">

      {/* ── Logo ──────────────────────────────────────────── */}
      <div
        className={cn(
          'flex h-14 shrink-0 items-center border-b border-[hsl(var(--sidebar-border))]',
          collapsed ? 'justify-center px-3' : 'px-4 gap-2.5'
        )}
      >
        {/* Brand mark */}
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--brand))]">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>

        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              key="brand"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden"
            >
              <p className="whitespace-nowrap text-[13px] font-semibold tracking-tight text-white">
                Smart Leads
              </p>
              <p className="whitespace-nowrap text-[10px] text-[hsl(var(--sidebar-text))] -mt-0.5">
                CRM Platform
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Navigation ────────────────────────────────────── */}
      <nav
        aria-label="Primary navigation"
        className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-2"
      >
        {NAV_GROUPS.map((group, groupIdx) => (
          <div key={group.label}>
            {groupIdx > 0 && (
              <SidebarSection label={group.label} collapsed={collapsed} />
            )}
            {groupIdx === 0 && !collapsed && (
              <p className="mb-1 px-2.5 text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-[hsl(220,12%,30%)]">
                {group.label}
              </p>
            )}
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => (
                <SidebarNavItem key={item.to} item={item} collapsed={collapsed} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Footer ────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-[hsl(var(--sidebar-border))] p-2 space-y-0.5">
        {/* User card */}
        <div
          className={cn(
            'flex items-center gap-2.5 rounded-md px-2.5 py-2',
            collapsed && 'justify-center'
          )}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(231,60%,35%)] text-xs font-semibold text-white">
            {initials}
          </div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                key="user-info"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.18 }}
                className="min-w-0 overflow-hidden"
              >
                <p className="truncate whitespace-nowrap text-xs font-medium text-white">
                  {user?.name ?? 'User'}
                </p>
                <p className="whitespace-nowrap text-[10px] text-[hsl(var(--sidebar-text))]">
                  {user?.role === 'admin' ? 'Administrator' : 'Sales User'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Logout */}
        <button
          onClick={() => void logout()}
          title={collapsed ? 'Sign out' : undefined}
          className={cn(
            'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2',
            'text-[hsl(var(--sidebar-text))] transition-colors duration-150',
            'hover:bg-[hsl(var(--sidebar-hover))] hover:text-white',
            collapsed && 'justify-center'
          )}
        >
          <LogOut className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                key="logout-label"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden whitespace-nowrap text-xs"
              >
                Sign out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
};

/* ── Main Sidebar (Desktop + Mobile drawer) ─────────────────── */

export const Sidebar = () => {
  const { isSidebarCollapsed, isMobileSidebarOpen, toggleSidebar, closeMobileSidebar } = useUIStore();
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  return (
    <>
      {/* ── Desktop Sidebar ─────────────────────────────── */}
      <motion.aside
        key="desktop-sidebar"
        animate={{ width: isSidebarCollapsed ? 60 : 240 }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        className="relative hidden shrink-0 flex-col border-r border-[hsl(var(--sidebar-border))] lg:flex"
        aria-label="Main navigation"
      >
        <SidebarContent collapsed={isSidebarCollapsed} />

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'absolute -right-3 top-[4.5rem] z-10',
            'flex h-6 w-6 items-center justify-center rounded-full',
            'bg-[hsl(var(--bg-surface))] border border-[hsl(var(--border-default))]',
            'text-[hsl(var(--text-tertiary))] shadow-[var(--shadow-sm)]',
            'transition-colors hover:text-[hsl(var(--text-primary))] hover:border-[hsl(var(--border-strong))]',
            'cursor-pointer'
          )}
        >
          <motion.div
            animate={{ rotate: isSidebarCollapsed ? 180 : 0 }}
            transition={{ duration: 0.22 }}
          >
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
          </motion.div>
        </button>
      </motion.aside>

      {/* ── Mobile Sidebar (drawer) ──────────────────────── */}
      <AnimatePresence>
        {isMobileSidebarOpen && !isDesktop && (
          <>
            {/* Backdrop */}
            <motion.div
              key="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-[hsl(222,47%,10%)]/50 backdrop-blur-[2px] lg:hidden"
              onClick={closeMobileSidebar}
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.aside
              key="mobile-drawer"
              variants={slideInLeftVariants}
              initial="initial"
              animate="enter"
              exit="exit"
              className="fixed inset-y-0 left-0 z-50 w-60 lg:hidden"
              aria-label="Mobile navigation"
            >
              <SidebarContent collapsed={false} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

/* ── Mobile menu toggle (used in TopBar) ────────────────────── */

export const MobileMenuToggle = () => {
  const { isMobileSidebarOpen, toggleMobileSidebar } = useUIStore();
  return (
    <button
      onClick={toggleMobileSidebar}
      aria-label={isMobileSidebarOpen ? 'Close navigation' : 'Open navigation'}
      aria-expanded={isMobileSidebarOpen}
      className="flex h-8 w-8 items-center justify-center rounded-md text-[hsl(var(--text-secondary))] transition-colors hover:bg-[hsl(var(--bg-subtle))] hover:text-[hsl(var(--text-primary))] lg:hidden"
    >
      {isMobileSidebarOpen ? (
        <X className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Menu className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
};
