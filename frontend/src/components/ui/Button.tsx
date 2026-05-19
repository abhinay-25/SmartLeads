import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@lib/cn';

const buttonVariants = cva(
  // Base styles shared by all variants
  [
    'inline-flex items-center justify-center gap-2 font-medium rounded-md',
    'transition-colors duration-150 cursor-pointer select-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-40',
    'whitespace-nowrap shrink-0',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-[hsl(var(--brand))] text-white',
          'hover:bg-[hsl(var(--brand-hover))]',
          'shadow-[var(--shadow-xs)]',
        ],
        secondary: [
          'bg-[hsl(var(--bg-surface))] text-[hsl(var(--text-primary))]',
          'border border-[hsl(var(--border-default))]',
          'hover:bg-[hsl(var(--bg-subtle))] hover:border-[hsl(var(--border-strong))]',
          'shadow-[var(--shadow-xs)]',
        ],
        ghost: [
          'text-[hsl(var(--text-secondary))]',
          'hover:bg-[hsl(var(--bg-subtle))] hover:text-[hsl(var(--text-primary))]',
        ],
        danger: [
          'bg-[hsl(var(--danger))] text-white',
          'hover:bg-[hsl(0,72%,44%)]',
          'shadow-[var(--shadow-xs)]',
        ],
        outline: [
          'border border-[hsl(var(--brand))] text-[hsl(var(--brand))]',
          'hover:bg-[hsl(var(--brand-subtle))]',
        ],
      },
      size: {
        xs: 'h-7 px-2.5 text-xs gap-1.5',
        sm: 'h-8 px-3 text-sm',
        md: 'h-9 px-4 text-sm',
        lg: 'h-10 px-5 text-sm',
        xl: 'h-11 px-6 text-base',
        icon: 'h-8 w-8 p-0',
        'icon-sm': 'h-7 w-7 p-0',
        'icon-lg': 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled ?? loading}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <svg
            className="h-3.5 w-3.5 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
            <path
              d="M12 2a10 10 0 0 1 10 10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
