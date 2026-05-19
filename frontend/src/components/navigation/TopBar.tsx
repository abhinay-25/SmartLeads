import { useRef, useState } from 'react';
import { Search, Bell, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MobileMenuToggle } from './Sidebar';
import { useAuthStore } from '@store/authStore';
import { useLogout } from '@hooks/useLogout';
import { useOnClickOutside } from '@hooks/useOnClickOutside';
import { cn } from '@lib/cn';
import { dropdownVariants } from '@lib/motion';

/* ── Route → Page title mapping ────────────────────────────── */
const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/leads':     'Leads',
  '/settings':  'Settings',
};

/* ── User dropdown menu ─────────────────────────────────────── */
const UserMenu = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const user         = useAuthStore((s) => s.user);
  const { logout }   = useLogout();

  useOnClickOutside(ref as React.RefObject<HTMLElement>, () => setOpen(false));

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <div ref={ref} className="relative">
      <button
        id="user-menu-button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-2 rounded-lg px-1.5 py-1',
          'transition-colors hover:bg-[hsl(var(--bg-subtle))]',
          open && 'bg-[hsl(var(--bg-subtle))]'
        )}
      >
        {/* Avatar */}
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(var(--brand-muted))] text-xs font-semibold text-[hsl(var(--brand))]">
          {initials}
        </div>

        {/* Name — desktop only */}
        <span className="hidden text-[13px] font-medium text-[hsl(var(--text-primary))] md:block">
          {user?.name?.split(' ')[0] ?? 'User'}
        </span>

        <ChevronDown
          className={cn(
            'hidden h-3.5 w-3.5 text-[hsl(var(--text-tertiary))] transition-transform duration-150 md:block',
            open && 'rotate-180'
          )}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-labelledby="user-menu-button"
            variants={dropdownVariants}
            initial="initial"
            animate="enter"
            exit="exit"
            className={cn(
              'absolute right-0 top-full z-50 mt-1.5 w-52',
              'rounded-xl border border-[hsl(var(--border-subtle))]',
              'bg-[hsl(var(--bg-surface))] shadow-[var(--shadow-lg)]',
              'overflow-hidden'
            )}
          >
            {/* User info header */}
            <div className="border-b border-[hsl(var(--border-subtle))] px-4 py-3">
              <p className="text-[13px] font-medium text-[hsl(var(--text-primary))]">
                {user?.name ?? 'User'}
              </p>
              <p className="mt-0.5 text-[11px] text-[hsl(var(--text-tertiary))]">
                {user?.email ?? ''}
              </p>
              <span className="mt-1.5 inline-flex items-center rounded-full border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-subtle))] px-2 py-0.5 text-[10px] font-medium capitalize text-[hsl(var(--text-secondary))]">
                {user?.role === 'admin' ? 'Administrator' : 'Sales User'}
              </span>
            </div>

            {/* Menu items */}
            <div className="p-1">
              <Link
                to="/settings"
                role="menuitem"
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2',
                  'text-[13px] text-[hsl(var(--text-secondary))]',
                  'transition-colors hover:bg-[hsl(var(--bg-subtle))] hover:text-[hsl(var(--text-primary))]'
                )}
              >
                <User className="h-3.5 w-3.5" aria-hidden="true" />
                Profile & Account
              </Link>
              <Link
                to="/settings"
                role="menuitem"
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2',
                  'text-[13px] text-[hsl(var(--text-secondary))]',
                  'transition-colors hover:bg-[hsl(var(--bg-subtle))] hover:text-[hsl(var(--text-primary))]'
                )}
              >
                <Settings className="h-3.5 w-3.5" aria-hidden="true" />
                Workspace settings
              </Link>
            </div>

            {/* Logout */}
            <div className="border-t border-[hsl(var(--border-subtle))] p-1">
              <button
                role="menuitem"
                onClick={() => { setOpen(false); void logout(); }}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-lg px-3 py-2',
                  'text-[13px] text-[hsl(var(--danger))]',
                  'transition-colors hover:bg-[hsl(var(--danger-bg))]'
                )}
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ── TopBar ────────────────────────────────────────────────── */
export const TopBar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const pageTitle = PAGE_TITLES[pathname] ?? 'Smart Leads';

  return (
    <header
      className={cn(
        'flex h-14 shrink-0 items-center justify-between gap-4',
        'border-b border-[hsl(var(--border-subtle))]',
        'bg-[hsl(var(--bg-surface))]',
        'px-5',
      )}
    >
      {/* Left: mobile toggle + page title */}
      <div className="flex min-w-0 items-center gap-3">
        <MobileMenuToggle />
        <h1 className="type-h3 hidden truncate sm:block">{pageTitle}</h1>
      </div>

      {/* Center: search (desktop only) */}
      <form 
        className="hidden max-w-sm flex-1 md:flex"
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const search = formData.get('search') as string;
          if (search) {
            navigate(`/leads?search=${encodeURIComponent(search)}`);
          }
        }}
      >
        <label
          className={cn(
            'flex w-full cursor-text items-center gap-2 rounded-lg',
            'border border-[hsl(var(--border-default))] bg-[hsl(var(--bg-subtle))]',
            'px-3 py-1.5 transition-all duration-150',
            'hover:border-[hsl(var(--border-strong))]',
            'focus-within:border-[hsl(var(--brand))] focus-within:bg-[hsl(var(--bg-surface))] focus-within:shadow-[0_0_0_3px_hsl(var(--brand)/0.08)]'
          )}
        >
          <Search className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--text-tertiary))]" aria-hidden="true" />
          <input
            name="search"
            type="search"
            placeholder="Search leads, contacts…"
            aria-label="Global search"
            className="flex-1 bg-transparent text-sm text-[hsl(var(--text-primary))] outline-none placeholder:text-[hsl(var(--text-tertiary))]"
          />
          <kbd
            className="hidden shrink-0 rounded border border-[hsl(var(--border-default))] bg-[hsl(var(--bg-surface))] px-1.5 py-0.5 text-[0.625rem] font-medium text-[hsl(var(--text-tertiary))] lg:inline-flex"
            aria-label="Keyboard shortcut: Command K"
          >
            ⌘K
          </kbd>
        </label>
      </form>

      {/* Right: notifications + user menu */}
      <div className="flex shrink-0 items-center gap-1.5">
        {/* Mobile search trigger */}
        <button
          aria-label="Search"
          className="flex h-8 w-8 items-center justify-center rounded-md text-[hsl(var(--text-secondary))] transition-colors hover:bg-[hsl(var(--bg-subtle))] hover:text-[hsl(var(--text-primary))] md:hidden"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
        </button>

        {/* Notifications */}
        <button
          aria-label="Notifications (3 unread)"
          className="relative flex h-8 w-8 items-center justify-center rounded-md text-[hsl(var(--text-secondary))] transition-colors hover:bg-[hsl(var(--bg-subtle))] hover:text-[hsl(var(--text-primary))]"
        >
          <Bell className="h-4 w-4" aria-hidden="true" />
          <span
            className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[hsl(var(--danger))] ring-2 ring-[hsl(var(--bg-surface))]"
            aria-hidden="true"
          />
        </button>

        {/* Divider */}
        <div className="mx-1 h-5 w-px bg-[hsl(var(--border-subtle))]" aria-hidden="true" />

        {/* User menu with dropdown */}
        <UserMenu />
      </div>
    </header>
  );
};
