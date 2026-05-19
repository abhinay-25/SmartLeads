import { useState, useCallback } from 'react';

/**
 * Manages boolean toggle state — for modals, dropdowns, panels.
 *
 * @example
 * const [isOpen, open, close, toggle] = useDisclosure();
 */
export const useDisclosure = (
  initialState = false
): [boolean, () => void, () => void, () => void] => {
  const [isOpen, setIsOpen] = useState(initialState);

  const open   = useCallback(() => setIsOpen(true), []);
  const close  = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return [isOpen, open, close, toggle];
};
