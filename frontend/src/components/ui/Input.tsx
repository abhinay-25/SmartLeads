import { forwardRef } from 'react';
import { cn } from '@lib/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftElement, rightElement, id, ...props }, ref) => {
    const inputId = id ?? `input-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="type-label text-[hsl(var(--text-primary))]"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftElement && (
            <div className="pointer-events-none absolute left-3 text-[hsl(var(--text-tertiary))]">
              {leftElement}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              'input-base',
              'px-3 py-2',
              leftElement && 'pl-9',
              rightElement && 'pr-9',
              error && 'border-[hsl(var(--danger))] focus:shadow-[0_0_0_3px_hsl(var(--danger-bg))]',
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />

          {rightElement && (
            <div className="absolute right-3 text-[hsl(var(--text-tertiary))]">
              {rightElement}
            </div>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} className="type-caption text-[hsl(var(--danger))]" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="type-caption">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
