import { useRef } from 'react';
import { Search, X, ChevronDown, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { cn } from '@lib/cn';
import type { LeadStatus, LeadSource, LeadSortOrder } from '@/types';
import type { useLeadFilters } from '@hooks/useLeadFilters';

// ── Option constants ──────────────────────────────────────────────────

const STATUS_OPTIONS: { value: LeadStatus | ''; label: string }[] = [
  { value: '',          label: 'All statuses' },
  { value: 'new',       label: 'New'          },
  { value: 'contacted', label: 'Contacted'    },
  { value: 'qualified', label: 'Qualified'    },
  { value: 'converted', label: 'Converted'    },
  { value: 'lost',      label: 'Lost'         },
];

const SOURCE_OPTIONS: { value: LeadSource | ''; label: string }[] = [
  { value: '',          label: 'All sources' },
  { value: 'website',   label: 'Website'     },
  { value: 'instagram', label: 'Instagram'   },
  { value: 'referral',  label: 'Referral'    },
  { value: 'social',    label: 'Social'      },
  { value: 'email',     label: 'Email'       },
  { value: 'other',     label: 'Other'       },
];

const SORT_OPTIONS: { value: LeadSortOrder; label: string }[] = [
  { value: 'latest', label: 'Latest first' },
  { value: 'oldest', label: 'Oldest first' },
];

// ── FilterSelect ──────────────────────────────────────────────────────

interface FilterSelectProps<T extends string> {
  value:    T;
  onChange: (v: T) => void;
  options:  { value: T; label: string }[];
  id:       string;
  label:    string;
  active?:  boolean;
}

const FilterSelect = <T extends string>({
  value, onChange, options, id, label, active,
}: FilterSelectProps<T>) => (
  <div className="relative">
    <label htmlFor={id} className="sr-only">{label}</label>
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className={cn(
        'h-8 appearance-none rounded-lg border px-3 pr-7 text-[13px] transition-colors',
        'bg-white outline-none cursor-pointer',
        'focus:border-[hsl(var(--brand))] focus:ring-2 focus:ring-[hsl(var(--brand)/0.12)]',
        active
          ? 'border-[hsl(var(--brand))] text-[hsl(var(--brand))] font-medium'
          : 'border-[hsl(var(--border-default))] text-[hsl(var(--text-secondary))]'
      )}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
    <ChevronDown
      className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-[hsl(var(--text-tertiary))]"
      aria-hidden="true"
    />
  </div>
);

// ── LeadsToolbar ──────────────────────────────────────────────────────

type FilterState = ReturnType<typeof useLeadFilters>;

interface LeadsToolbarProps extends Pick<
  FilterState,
  | 'searchInput' | 'setSearchInput'
  | 'status'  | 'setStatus'
  | 'source'  | 'setSource'
  | 'sort'    | 'setSort'
  | 'hasActiveFilters' | 'activeFilterCount' | 'resetFilters'
> {}

export const LeadsToolbar = ({
  searchInput, setSearchInput,
  status,      setStatus,
  source,      setSource,
  sort,        setSort,
  hasActiveFilters, activeFilterCount, resetFilters,
}: LeadsToolbarProps) => {
  const searchRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* ── Left: search ────────────────────────────────────── */}
      <form 
        className="relative w-full max-w-xs"
        onSubmit={(e) => e.preventDefault()}
      >
        <Input
          ref={searchRef}
          id="leads-search"
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search name or email…"
          autoComplete="off"
          spellCheck={false}
          aria-label="Search leads"
          leftElement={<Search className="h-3.5 w-3.5" aria-hidden="true" />}
          rightElement={
            searchInput ? (
              <button
                type="button"
                onClick={() => { setSearchInput(''); searchRef.current?.focus(); }}
                aria-label="Clear search"
                className="text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null
          }
        />
      </form>

      {/* ── Right: filters + sort ────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Filter icon */}
        <span className="flex items-center gap-1.5 text-[12px] text-[hsl(var(--text-tertiary))]">
          <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">Filter</span>
          {activeFilterCount > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[hsl(var(--brand))] text-[10px] font-semibold text-white">
              {activeFilterCount}
            </span>
          )}
        </span>

        <FilterSelect
          id="leads-filter-status"
          label="Filter by status"
          value={status}
          onChange={setStatus}
          options={STATUS_OPTIONS}
          active={!!status}
        />

        <FilterSelect
          id="leads-filter-source"
          label="Filter by source"
          value={source}
          onChange={setSource}
          options={SOURCE_OPTIONS}
          active={!!source}
        />

        {/* Divider */}
        <span className="hidden h-4 w-px bg-[hsl(var(--border-subtle))] sm:block" aria-hidden="true" />

        <FilterSelect
          id="leads-sort"
          label="Sort order"
          value={sort}
          onChange={setSort}
          options={SORT_OPTIONS}
        />

        {/* Reset — only shown when filters active */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            aria-label="Reset all filters"
            className="gap-1.5 text-[hsl(var(--text-secondary))]"
          >
            <RotateCcw className="h-3 w-3" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">Reset</span>
          </Button>
        )}
      </div>
    </div>
  );
};
