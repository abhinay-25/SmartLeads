import { forwardRef } from 'react';
import { cn } from '@lib/cn';
import { ChevronDown } from 'lucide-react';
import type { SelectOption } from '@/types';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, options, placeholder, id, ...props }, ref) => {
    const selectId = id ?? `select-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="type-label text-[hsl(var(--text-primary))]"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'input-base appearance-none pr-9 cursor-pointer',
              error && 'border-[hsl(var(--danger))] focus:shadow-[0_0_0_3px_hsl(var(--danger-bg))]',
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="pointer-events-none absolute right-3 text-[hsl(var(--text-tertiary))]">
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </div>
        </div>

        {error && (
          <p id={`${selectId}-error`} className="type-caption text-[hsl(var(--danger))]" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${selectId}-hint`} className="type-caption">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
