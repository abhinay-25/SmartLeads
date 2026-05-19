import { cn } from '@lib/cn';

/* ── Page Header ─────────────────────────────────────────────── */
interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumb?: React.ReactNode;
  className?: string;
}

export const PageHeader = ({
  title,
  description,
  actions,
  breadcrumb,
  className,
}: PageHeaderProps) => {
  return (
    <div className={cn('mb-6 flex items-start justify-between gap-4', className)}>
      <div className="min-w-0 flex-1">
        {breadcrumb && (
          <div className="mb-1.5">{breadcrumb}</div>
        )}
        <h1 className="type-h1 truncate">{title}</h1>
        {description && (
          <p className="type-body mt-1">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  );
};

/* ── Page Container ──────────────────────────────────────────── */
interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * constrained: wraps content to max-w-5xl (useful for settings/forms)
   * full:        no max-width (default — tables, grids fill available width)
   */
  constrained?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  children?: React.ReactNode;
}

const MAX_WIDTH_MAP = {
  sm:   'max-w-lg',
  md:   'max-w-2xl',
  lg:   'max-w-4xl',
  xl:   'max-w-5xl',
  '2xl':'max-w-7xl',
  full: '',
};

export const PageContainer = ({
  children,
  className,
  constrained = false,
  maxWidth,
  ...props
}: PageContainerProps) => (
  <div
    className={cn(
      constrained && 'mx-auto max-w-5xl',
      maxWidth && MAX_WIDTH_MAP[maxWidth],
      className
    )}
    {...props}
  >
    {children}
  </div>
);


/* ── Section ─────────────────────────────────────────────────── */
export const Section = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <section className={cn('mb-8', className)} {...props}>
    {children}
  </section>
);

/* ── Divider ─────────────────────────────────────────────────── */
export const Divider = ({ className }: { className?: string }) => (
  <div className={cn('divider my-4', className)} aria-hidden="true" />
);

/* ── Stat Card ───────────────────────────────────────────────── */
interface StatCardProps {
  label: string;
  value: string | number;
  change?: { value: string; direction: 'up' | 'down' | 'neutral' };
  icon?: React.ReactNode;
  className?: string;
}

export const StatCard = ({ label, value, change, icon, className }: StatCardProps) => {
  const changeColor =
    change?.direction === 'up'
      ? 'text-[hsl(var(--success))]'
      : change?.direction === 'down'
      ? 'text-[hsl(var(--danger))]'
      : 'text-[hsl(var(--text-tertiary))]';

  return (
    <div className={cn('card p-5', className)}>
      <div className="flex items-start justify-between gap-2">
        <p className="type-overline">{label}</p>
        {icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--brand-subtle))] text-[hsl(var(--brand))]">
            {icon}
          </div>
        )}
      </div>
      <p className="mt-2 text-2xl font-700 tracking-tight text-[hsl(var(--text-primary))]">
        {value}
      </p>
      {change && (
        <p className={cn('mt-1 type-caption', changeColor)}>
          {change.direction === 'up' ? '↑' : change.direction === 'down' ? '↓' : '→'}{' '}
          {change.value}
        </p>
      )}
    </div>
  );
};
