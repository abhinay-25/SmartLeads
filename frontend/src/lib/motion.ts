import type { Variants } from 'framer-motion';

/**
 * Framer Motion animation variants for consistent motion across the app.
 * Philosophy: Motion should be purposeful and subtle — never decorative.
 */

/* ── Page-level transitions ──────────────────────────────────── */
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  enter:   { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } },
  exit:    { opacity: 0, y: -4, transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] } },
};

/* ── Fade ─────────────────────────────────────────────────────── */
export const fadeVariants: Variants = {
  initial: { opacity: 0 },
  enter:   { opacity: 1, transition: { duration: 0.18, ease: 'easeOut' } },
  exit:    { opacity: 0, transition: { duration: 0.12, ease: 'easeIn' } },
};

/* ── Slide-up for cards, panels ──────────────────────────────── */
export const slideUpVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  enter:   { opacity: 1, y: 0,  transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] } },
  exit:    { opacity: 0, y: 6,  transition: { duration: 0.15, ease: 'easeIn' } },
};

/* ── Slide-in from left (sidebar overlay on mobile) ─────────── */
export const slideInLeftVariants: Variants = {
  initial: { x: '-100%', opacity: 0 },
  enter:   { x: 0, opacity: 1, transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } },
  exit:    { x: '-100%', opacity: 0, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } },
};

/* ── Dropdown / popover ──────────────────────────────────────── */
export const dropdownVariants: Variants = {
  initial: { opacity: 0, scale: 0.97, y: -4 },
  enter:   { opacity: 1, scale: 1, y: 0, transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] } },
  exit:    { opacity: 0, scale: 0.97, y: -4, transition: { duration: 0.1 } },
};

/* ── Modal / dialog ──────────────────────────────────────────── */
export const modalBackdropVariants: Variants = {
  initial: { opacity: 0 },
  enter:   { opacity: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, transition: { duration: 0.15 } },
};

export const modalVariants: Variants = {
  initial: { opacity: 0, scale: 0.96, y: 16 },
  enter:   { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } },
  exit:    { opacity: 0, scale: 0.96, y: 16, transition: { duration: 0.15 } },
};

/* ── Stagger children ────────────────────────────────────────── */
export const staggerContainerVariants: Variants = {
  initial: {},
  enter:   { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};

export const staggerItemVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  enter:   { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } },
};

/* ── Sidebar collapse ────────────────────────────────────────── */
export const sidebarVariants = {
  expanded: { width: 240 },
  collapsed: { width: 60, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } },
};

/* ── Toast / notification ────────────────────────────────────── */
export const toastVariants: Variants = {
  initial: { opacity: 0, x: 24, scale: 0.96 },
  enter:   { opacity: 1, x: 0,  scale: 1, transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] } },
  exit:    { opacity: 0, x: 24, scale: 0.96, transition: { duration: 0.15 } },
};
