import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { cn } from '@lib/cn';
import type { PaginationMeta } from '@/types';

interface LeadsPaginationProps {
  meta:      PaginationMeta;
  onPage:    (page: number) => void;
  isFetching?: boolean;
}

export const LeadsPagination = ({ meta, onPage, isFetching }: LeadsPaginationProps) => {
  const { page, totalPages, perPage, total, hasPrev, hasNext } = meta;

  const from = Math.min((page - 1) * perPage + 1, total);
  const to   = Math.min(page * perPage, total);

  // Page number window — always show up to 5 pages
  const pageWindow = (() => {
    const delta   = 2;
    const left    = Math.max(1, page - delta);
    const right   = Math.min(totalPages, page + delta);
    const pages: number[] = [];
    for (let i = left; i <= right; i++) pages.push(i);
    return pages;
  })();

  return (
    <div className="flex items-center justify-between border-t border-[hsl(var(--border-subtle))] px-4 py-3">
      {/* Left — result count */}
      <p className="text-[12px] text-[hsl(var(--text-tertiary))]">
        {total === 0 ? (
          'No results'
        ) : (
          <>
            Showing{' '}
            <span className="font-medium text-[hsl(var(--text-primary))]">{from}–{to}</span>
            {' '}of{' '}
            <span className="font-medium text-[hsl(var(--text-primary))]">
              {total.toLocaleString()}
            </span>
            {' '}leads
          </>
        )}
      </p>

      {/* Right — page controls */}
      <nav
        className="flex items-center gap-1"
        aria-label="Pagination"
        role="navigation"
      >
        {/* Prev */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onPage(page - 1)}
          disabled={!hasPrev || isFetching}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>

        {/* Page numbers */}
        <div className="flex items-center gap-0.5">
          {pageWindow.length > 0 && pageWindow[0]! > 1 && (
            <>
              <PageButton page={1} current={page} onClick={onPage} disabled={isFetching} />
              {pageWindow[0]! > 2 && (
                <span className="px-1 text-[12px] text-[hsl(var(--text-tertiary))]">…</span>
              )}
            </>
          )}

          {pageWindow.map((p) => (
            <PageButton
              key={p}
              page={p}
              current={page}
              onClick={onPage}
              disabled={isFetching}
            />
          ))}

          {pageWindow.length > 0 && pageWindow[pageWindow.length - 1]! < totalPages && (
            <>
              {pageWindow[pageWindow.length - 1]! < totalPages - 1 && (
                <span className="px-1 text-[12px] text-[hsl(var(--text-tertiary))]">…</span>
              )}
              <PageButton page={totalPages} current={page} onClick={onPage} disabled={isFetching} />
            </>
          )}
        </div>

        {/* Next */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onPage(page + 1)}
          disabled={!hasNext || isFetching}
          aria-label="Next page"
        >
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </nav>
    </div>
  );
};

// ── PageButton ────────────────────────────────────────────────────────

interface PageButtonProps {
  page:     number;
  current:  number;
  onClick:  (page: number) => void;
  disabled?: boolean;
}

const PageButton = ({ page, current, onClick, disabled }: PageButtonProps) => {
  const isActive = page === current;
  return (
    <button
      type="button"
      onClick={() => onClick(page)}
      disabled={disabled || isActive}
      aria-label={`Page ${page}`}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex h-6 min-w-[24px] items-center justify-center rounded px-1.5',
        'text-[12px] transition-colors',
        isActive
          ? 'bg-[hsl(var(--brand))] text-white font-semibold cursor-default'
          : 'text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-muted))] hover:text-[hsl(var(--text-primary))]'
      )}
    >
      {page}
    </button>
  );
};
