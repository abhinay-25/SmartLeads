import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * AuthLayout — split-screen design.
 *
 * Left panel:  Brand / illustration (hidden on mobile)
 * Right panel: Form content (full width on mobile)
 *
 * Design:  Linear-style minimal, indigo brand left panel
 *          Clean white form panel with generous padding
 */
export const AuthLayout = () => {
  return (
    <div className="flex min-h-screen bg-[hsl(var(--bg-app))]">
      {/* ── Left panel: brand/visual ──────────────────────────────── */}
      <div className="relative hidden w-[480px] shrink-0 flex-col overflow-hidden bg-[hsl(var(--sidebar-bg))] lg:flex">
        {/* Subtle radial glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% -10%, hsl(231 78% 40% / 0.35) 0%, transparent 70%)',
          }}
        />

        {/* Grid pattern overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Content */}
        <div className="relative flex h-full flex-col p-10">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[hsl(var(--brand))]">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white" aria-hidden="true">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-white">
              Smart Leads
            </span>
          </motion.div>

          {/* Hero text */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-auto pb-4"
          >
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
              <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--brand))]" />
              CRM Intelligence Platform
            </p>
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-white">
              Turn prospects into <br />
              <span className="text-[hsl(231,70%,72%)]">loyal customers.</span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[hsl(var(--sidebar-text))]">
              Manage your leads pipeline, track conversations, and close deals faster with intelligent automation.
            </p>
          </motion.div>

          {/* Feature list */}
          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-10 space-y-2.5"
          >
            {[
              'Unified lead pipeline',
              'Real-time team collaboration',
              'Advanced filtering & search',
              'CSV export & reporting',
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-2.5 text-sm text-[hsl(var(--sidebar-text))]">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--brand)/0.2)]">
                  <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" fill="none" aria-hidden="true">
                    <path d="M2 5.5l2 2 4-4" stroke="hsl(231,70%,72%)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                {feature}
              </li>
            ))}
          </motion.ul>
        </div>
      </div>

      {/* ── Right panel: form ─────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-2.5 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--brand))]">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="text-[15px] font-semibold text-[hsl(var(--text-primary))]">Smart Leads</span>
        </div>

        {/* Page content (Login / Register) */}
        <motion.div
          key="auth-form"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-[400px]"
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
};
