import { useState, useEffect } from 'react';

/**
 * Listens to a CSS media query and returns whether it matches.
 * Updates reactively when the viewport changes.
 *
 * @example
 * const isDesktop = useMediaQuery('(min-width: 1024px)');
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);

    mql.addEventListener('change', onChange);
    setMatches(mql.matches);

    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
};
