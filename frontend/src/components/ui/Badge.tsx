import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@lib/cn';

const badgeVariants = cva(
  'badge-base',
  {
    variants: {
      variant: {
        success: 'badge-success',
        warning: 'badge-warning',
        danger:  'badge-danger',
        info:    'badge-info',
        neutral: 'badge-neutral',
        brand: [
          'bg-[hsl(var(--brand-subtle))] text-[hsl(var(--brand))]',
        ],
      },
      size: {
        sm: 'text-[0.6875rem] px-2 py-0.5',
        md: '',
      },
    },
    defaultVariants: {
      variant: 'neutral',
      size: 'md',
    },
  }
);

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export const Badge = ({ className, variant, size, dot, children, ...props }: BadgeProps) => {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span
          className="inline-block h-1.5 w-1.5 rounded-full bg-current"
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
};
