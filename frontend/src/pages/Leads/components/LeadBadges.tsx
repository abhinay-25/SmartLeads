import { Badge } from '@components/ui/Badge';
import type { LeadStatus, LeadSource } from '@/types';

// ── Status config ─────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  LeadStatus,
  { label: string; variant: 'info' | 'warning' | 'neutral' | 'success' | 'danger' }
> = {
  new:       { label: 'New',       variant: 'info'    },
  contacted: { label: 'Contacted', variant: 'warning' },
  qualified: { label: 'Qualified', variant: 'neutral' },
  converted: { label: 'Converted', variant: 'success' },
  lost:      { label: 'Lost',      variant: 'danger'  },
};

const SOURCE_LABELS: Record<LeadSource, string> = {
  website:   'Website',
  instagram: 'Instagram',
  referral:  'Referral',
  social:    'Social',
  email:     'Email',
  other:     'Other',
};

// ── LeadStatusBadge ───────────────────────────────────────────────────

interface LeadStatusBadgeProps {
  status: LeadStatus;
}

export const LeadStatusBadge = ({ status }: LeadStatusBadgeProps) => {
  const config = STATUS_CONFIG[status] ?? { label: status, variant: 'neutral' as const };
  return (
    <Badge variant={config.variant} dot>
      {config.label}
    </Badge>
  );
};

// ── LeadSourceLabel ───────────────────────────────────────────────────

interface LeadSourceLabelProps {
  source: LeadSource;
  className?: string;
}

export const LeadSourceLabel = ({ source, className }: LeadSourceLabelProps) => (
  <span className={className}>
    {SOURCE_LABELS[source] ?? source}
  </span>
);

// ── LeadAvatar ────────────────────────────────────────────────────────

interface LeadAvatarProps {
  name: string;
}

export const LeadAvatar = ({ name }: LeadAvatarProps) => {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <span
      aria-hidden="true"
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--brand-subtle))] text-[0.6875rem] font-semibold text-[hsl(var(--brand))]"
    >
      {initials}
    </span>
  );
};
