import { useEffect } from 'react';

/**
 * Sets the document title. Restores to base title on unmount.
 *
 * @example
 * useDocumentTitle('Leads — Smart Leads');
 */
export const useDocumentTitle = (title: string, suffix = 'Smart Leads'): void => {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = suffix ? `${title} — ${suffix}` : title;
    return () => { document.title = prevTitle; };
  }, [title, suffix]);
};
