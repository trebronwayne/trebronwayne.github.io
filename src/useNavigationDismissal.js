import { useEffect } from 'react';

export function useNavigationDismissal(isOpen, close, headerSelector) {
  useEffect(() => {
    if (!isOpen || !window.matchMedia('(max-width: 850px)').matches) return;
    document.querySelector(`${headerSelector} nav a`)?.focus({ preventScroll: true });
  }, [isOpen, headerSelector]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        close();
        document.querySelector(`${headerSelector} button[aria-controls]`)?.focus();
      }
    };
    const dismissFromOutside = (event) => {
      if (event.target instanceof Element && !event.target.closest(headerSelector)) close();
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', dismissFromOutside);
    document.addEventListener('focusin', dismissFromOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', dismissFromOutside);
      document.removeEventListener('focusin', dismissFromOutside);
    };
  }, [isOpen, close, headerSelector]);
}
