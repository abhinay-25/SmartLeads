import { cn } from '@lib/cn';
import { motion } from 'framer-motion';

/* ── Empty state component ──────────────────────────────────── */
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
}

export const EmptyState = ({
  icon,
  title,
  description,
  action,
  className,
  compact = false,
}: EmptyStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'py-8 px-4' : 'py-16 px-6',
        className
      )}
    >
      {icon && (
        <motion.div
          initial={{ y: 5 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--bg-subtle))] text-[hsl(var(--text-tertiary))]"
        >
          {icon}
        </motion.div>
      )}
      <h3 className="type-h3 mb-1">{title}</h3>
      {description && (
        <p className="type-body-sm max-w-xs mb-4">{description}</p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </motion.div>
  );
};

/* ── Error state ────────────────────────────────────────────── */
interface ErrorStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const ErrorState = ({
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again.',
  action,
  className,
}: ErrorStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'flex flex-col items-center justify-center text-center py-12 px-6',
        className
      )}
    >
      <motion.div
        initial={{ rotate: -10, scale: 0.9 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ duration: 0.4, type: 'spring', bounce: 0.5 }}
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--danger-bg))] text-[hsl(var(--danger))]"
      >
        <svg
          className="h-6 w-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </motion.div>
      <h3 className="type-h3 mb-1">{title}</h3>
      <p className="type-body-sm max-w-xs mb-4">{description}</p>
      {action && <div className="mt-1">{action}</div>}
    </motion.div>
  );
};
