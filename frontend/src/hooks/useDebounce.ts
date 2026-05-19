import { useState, useEffect, useRef } from 'react';

/**
 * Debounces a value — useful for search inputs, filter fields.
 * Only updates the returned value after `delay` ms of no changes.
 *
 * @example
 * const debouncedSearch = useDebounce(searchQuery, 300);
 */
export const useDebounce = <T>(value: T, delay = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Debounces a callback function.
 * Useful when you need to debounce event handlers rather than state.
 */
export const useDebouncedCallback = <T extends (...args: unknown[]) => void>(
  callback: T,
  delay = 300
): T => {
  const timerRef = useRef<number | undefined>(undefined);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return ((...args: unknown[]) => {
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }) as T;
};
