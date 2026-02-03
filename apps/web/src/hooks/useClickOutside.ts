import { useEffect, RefObject, useCallback } from 'preact/hooks';

export function useClickOutside(
  ref: RefObject<HTMLElement>,
  handler: () => void
): void {
  const stableHandler = useCallback(handler, [handler]);

  useEffect(() => {
    const handleClick = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        stableHandler();
      }
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);

    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [ref, stableHandler]);
}
