import { useSearchParams } from 'react-router-dom';
import { useCallback } from 'react';

/**
 * Syncs table/list filter state with URL search params.
 * Enables shareable filtered views and back-button support.
 *
 * @example
 * const { params, setParam, resetParams } = useUrlParams();
 * const page = Number(params.get('page') ?? '1');
 */
export const useUrlParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string | null) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value === null || value === '') {
          next.delete(key);
        } else {
          next.set(key, value);
        }
        return next;
      });
    },
    [setSearchParams]
  );

  const resetParams = useCallback(
    (keep?: string[]) => {
      setSearchParams((prev) => {
        if (!keep) return new URLSearchParams();
        const next = new URLSearchParams();
        keep.forEach((k) => {
          const v = prev.get(k);
          if (v) next.set(k, v);
        });
        return next;
      });
    },
    [setSearchParams]
  );

  return { params: searchParams, setParam, resetParams };
};
