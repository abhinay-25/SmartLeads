import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from './useDebounce';
import type { LeadStatus, LeadSource, LeadSortOrder, LeadsQueryParams } from '@/types';

// ── Filter state shape ────────────────────────────────────────────────

export interface LeadFilterState {
  search:  string;
  status:  LeadStatus | '';
  source:  LeadSource | '';
  sort:    LeadSortOrder;
  page:    number;
  limit:   number;
}

const DEFAULT_FILTERS: LeadFilterState = {
  search: '',
  status: '',
  source: '',
  sort:   'latest',
  page:   1,
  limit:  10,
};

// ── helpers ───────────────────────────────────────────────────────────

/**
 * Apply a batch of key→value changes to URLSearchParams in a single
 * update so React Router never sees partial state.
 * value === null  → delete the key
 * value === ''    → delete the key
 * otherwise       → set the key
 */
function applyParams(
  prev: URLSearchParams,
  changes: Record<string, string | null>
): URLSearchParams {
  const next = new URLSearchParams(prev);
  for (const [key, value] of Object.entries(changes)) {
    if (value === null || value === '') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
  }
  return next;
}

// ── useLeadFilters ────────────────────────────────────────────────────
/**
 * Single source of truth for the leads table filter state.
 *
 * Key design decisions
 * ────────────────────
 * 1. ALL filter changes (status, source, sort, page) are batched into a
 *    SINGLE setSearchParams call via `applyParams`.  Two separate calls
 *    would each start from the same snapshot and the second would silently
 *    undo the first — that was the root cause of filters "not working".
 *
 * 2. The search box is LOCAL state + 350 ms debounce.  It is seeded once
 *    from the URL on mount (the global TopBar search navigates here with
 *    ?search=…) but is never overwritten by URL changes while the user
 *    is typing, preventing the bidirectional-sync race condition.
 */
export const useLeadFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // ── URL-backed filters ──────────────────────────────────────────
  const urlStatus = (searchParams.get('status') ?? '') as LeadStatus | '';
  const urlSource = (searchParams.get('source') ?? '') as LeadSource | '';
  const urlSort   = (searchParams.get('sort')   ?? 'latest') as LeadSortOrder;
  const urlPage   = Math.max(1, Number(searchParams.get('page') ?? '1'));

  // ── LOCAL search state ──────────────────────────────────────────
  const [searchInput, setSearchInput] = useState<string>(
    () => searchParams.get('search') ?? ''
  );
  const debouncedSearch = useDebounce(searchInput, 350);

  // Seed from URL when the TopBar search navigates to /leads?search=…
  // while the page is already mounted.
  const lastUrlSearch = useRef(searchParams.get('search') ?? '');
  useEffect(() => {
    const current = searchParams.get('search') ?? '';
    if (current && current !== lastUrlSearch.current) {
      setSearchInput(current);
    }
    lastUrlSearch.current = current;
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Filter setters — each is a SINGLE atomic URL update ─────────
  const setStatus = useCallback((value: LeadStatus | '') => {
    setSearchParams(
      (prev) => applyParams(prev, { status: value || null, page: null }),
      { replace: true }
    );
  }, [setSearchParams]);

  const setSource = useCallback((value: LeadSource | '') => {
    setSearchParams(
      (prev) => applyParams(prev, { source: value || null, page: null }),
      { replace: true }
    );
  }, [setSearchParams]);

  const setSort = useCallback((value: LeadSortOrder) => {
    setSearchParams(
      (prev) => applyParams(prev, { sort: value === 'latest' ? null : value, page: null }),
      { replace: true }
    );
  }, [setSearchParams]);

  const setPage = useCallback((value: number) => {
    setSearchParams(
      (prev) => applyParams(prev, { page: value <= 1 ? null : String(value) }),
      { replace: true }
    );
  }, [setSearchParams]);

  const resetFilters = useCallback(() => {
    setSearchInput('');
    lastUrlSearch.current = '';
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  // ── Active filter count ─────────────────────────────────────────
  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (urlStatus)       n++;
    if (urlSource)       n++;
    if (debouncedSearch) n++;
    return n;
  }, [urlStatus, urlSource, debouncedSearch]);

  // ── Query params for the API ────────────────────────────────────
  const queryParams: LeadsQueryParams = useMemo(() => ({
    page:   urlPage,
    limit:  DEFAULT_FILTERS.limit,
    sort:   urlSort,
    ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
    ...(urlStatus              ? { status: urlStatus }             : {}),
    ...(urlSource              ? { source: urlSource }             : {}),
  }), [urlPage, urlSort, debouncedSearch, urlStatus, urlSource]);

  return {
    searchInput,
    setSearchInput,

    status: urlStatus,
    source: urlSource,
    sort:   urlSort,
    page:   urlPage,
    limit:  DEFAULT_FILTERS.limit,

    setStatus,
    setSource,
    setSort,
    setPage,
    resetFilters,

    activeFilterCount,
    hasActiveFilters: activeFilterCount > 0,

    queryParams,
  };
};
