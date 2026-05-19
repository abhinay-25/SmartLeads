import type { ReactNode } from 'react';
import { forwardRef, useState } from 'react';
import { cn } from '@lib/cn';
import { Eye, EyeOff } from 'lucide-react';

// ── AuthField: label + input + error in one composable unit ──────

interface AuthFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label:       string;
  error?:      string;
  hint?:       string;
  leftIcon?:   ReactNode;
  id:          string;   // required for proper a11y labeling
}

export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(
  ({ label, error, hint, leftIcon, className, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={id}
          className="text-[13px] font-medium text-[hsl(var(--text-primary))]"
        >
          {label}
        </label>

        <div className="relative flex items-center">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3 text-[hsl(var(--text-tertiary))]">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
            className={cn(
              // Base
              'h-10 w-full rounded-lg border bg-white px-3 text-sm text-[hsl(var(--text-primary))]',
              'placeholder:text-[hsl(var(--text-tertiary))]',
              'outline-none transition-all duration-150',
              // Border
              'border-[hsl(var(--border-default))]',
              'hover:border-[hsl(var(--border-strong))]',
              'focus:border-[hsl(var(--brand))] focus:ring-3 focus:ring-[hsl(var(--brand)/0.12)]',
              // Error state
              error && 'border-[hsl(var(--danger))] focus:ring-[hsl(var(--danger)/0.12)]',
              // Left icon padding
              leftIcon && 'pl-9',
              className
            )}
            {...props}
          />
        </div>

        {error && (
          <p
            id={`${id}-error`}
            role="alert"
            className="text-[12px] leading-tight text-[hsl(var(--danger))]"
          >
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${id}-hint`} className="text-[12px] leading-tight text-[hsl(var(--text-tertiary))]">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

AuthField.displayName = 'AuthField';

// ── PasswordField: AuthField with show/hide toggle ───────────────

interface PasswordFieldProps extends Omit<AuthFieldProps, 'type'> {}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ className, label, error, hint, leftIcon, id, ...rest }, ref) => {
    const [show, setShow] = useState(false);

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={id}
          className="text-[13px] font-medium text-[hsl(var(--text-primary))]"
        >
          {label}
        </label>

        <div className="relative flex items-center">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3 text-[hsl(var(--text-tertiary))]">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            type={show ? 'text' : 'password'}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
            className={cn(
              'h-10 w-full rounded-lg border bg-white px-3 pr-10 text-sm text-[hsl(var(--text-primary))]',
              'placeholder:text-[hsl(var(--text-tertiary))]',
              'outline-none transition-all duration-150',
              'border-[hsl(var(--border-default))]',
              'hover:border-[hsl(var(--border-strong))]',
              'focus:border-[hsl(var(--brand))] focus:ring-3 focus:ring-[hsl(var(--brand)/0.12)]',
              error    && 'border-[hsl(var(--danger))] focus:ring-[hsl(var(--danger)/0.12)]',
              leftIcon && 'pl-9',
              className
            )}
            // ── CRITICAL: spread ALL remaining props so RHF's
            //    name / onChange / onBlur / value are forwarded
            {...rest}
          />

          {/* Show/hide toggle */}
          <button
            type="button"
            onClick={() => setShow((p) => !p)}
            aria-label={show ? 'Hide password' : 'Show password'}
            tabIndex={-1}
            className="absolute right-3 text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))]"
          >
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        {error && (
          <p
            id={`${id}-error`}
            role="alert"
            className="text-[12px] leading-tight text-[hsl(var(--danger))]"
          >
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${id}-hint`} className="text-[12px] leading-tight text-[hsl(var(--text-tertiary))]">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

PasswordField.displayName = 'PasswordField';

