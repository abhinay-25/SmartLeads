
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '@components/navigation/Sidebar';
import { TopBar } from '@components/navigation/TopBar';
import { pageVariants } from '@lib/motion';

/**
 * DashboardLayout — the root shell for all authenticated pages.
 *
 * Structure:
 *   ┌──────────────────────────────────────────────┐
 *   │ Sidebar (240px / 60px collapsed / drawer)    │
 *   │ ─────────────────────────────────────────── │
 *   │ TopBar (56px fixed)                          │
 *   │ ─────────────────────────────────────────── │
 *   │ <main>                                       │
 *   │   AnimatePresence key=location.key           │
 *   │     <Outlet />                               │
 *   └──────────────────────────────────────────────┘
 *
 * Decisions:
 * - `location.key` (not pathname) for AnimatePresence: pathname breaks
 *   when navigating to the same route with different params.
 * - Content is NOT max-width constrained here — each page decides its own
 *   `constrained` behaviour via PageContainer.
 * - `overflow-hidden` on the root div keeps the sidebar scroll-locked
 *   while only `<main>` scrolls independently.
 */
export const DashboardLayout = () => {
  const location = useLocation();

  return (
    <>
      {/* Skip-to-content — accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-[hsl(var(--brand))] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:shadow-lg"
      >
        Skip to main content
      </a>

      <div className="flex h-full overflow-hidden bg-[hsl(var(--bg-app))]">
        {/* Sidebar — animated width on desktop, drawer on mobile */}
        <Sidebar />

        {/* Main column — grows to fill remaining space */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <TopBar />

          {/*
           * Main content area.
           * - flex-1 + overflow-y-auto: only this area scrolls
           * - The motion.div wrapper handles page-enter animations
           * - Each page manages its own horizontal padding via PageContainer
           */}
          <main
            id="main-content"
            className="flex-1 overflow-y-auto"
            tabIndex={-1}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                variants={pageVariants}
                initial="initial"
                animate="enter"
                exit="exit"
                className="min-h-full p-6 lg:p-8"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </>
  );
};
