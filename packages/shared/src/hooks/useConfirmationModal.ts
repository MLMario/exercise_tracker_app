import { useState, useCallback } from 'preact/hooks';

type ModalState<T> =
  | { isOpen: false }
  | { isOpen: true; data: T };

export interface UseConfirmationModal<T> {
  isOpen: boolean;
  data: T | null;
  open: (data: T) => void;
  close: () => void;
}

/**
 * Manages confirmation modal state with a discriminated union.
 * Eliminates impossible states: `isOpen: true` with `data: null` cannot occur.
 *
 * Per `rerender-derived-state`: uses a single state object instead of
 * paired boolean + data states.
 */
export function useConfirmationModal<T>(): UseConfirmationModal<T> {
  const [state, setState] = useState<ModalState<T>>({ isOpen: false });

  const open = useCallback((data: T) => {
    setState({ isOpen: true, data });
  }, []);

  const close = useCallback(() => {
    setState({ isOpen: false });
  }, []);

  return {
    isOpen: state.isOpen,
    data: state.isOpen ? state.data : null,
    open,
    close,
  };
}
