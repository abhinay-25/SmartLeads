import { cn } from '@lib/cn';

/* ── Spinner ─────────────────────────────────────────────────── */
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const spinnerSizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' };

export const Spinner = ({ size = 'md', className }: SpinnerProps) => (
  <svg
    className={cn('animate-spin text-[hsl(var(--brand))]', spinnerSizes[size], className)}
    viewBox="0 0 24 24"
    fill="none"
    aria-label="Loading"
    role="status"
  >
    <circle
      cx="12" cy="12" r="10"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeOpacity="0.2"
    />
    <path
      d="M12 2a10 10 0 0 1 10 10"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

/* ── Page Loader ─────────────────────────────────────────────── */
export const PageLoader = () => (
  <div className="flex h-full min-h-[300px] w-full items-center justify-center">
    <Spinner size="lg" />
  </div>
);

/* ── Inline Loader ───────────────────────────────────────────── */
export const InlineLoader = ({ label = 'Loading...' }: { label?: string }) => (
  <div className="flex items-center gap-2 text-[hsl(var(--text-tertiary))]">
    <Spinner size="sm" />
    <span className="type-caption">{label}</span>
  </div>
);
