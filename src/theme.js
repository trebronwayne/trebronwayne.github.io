import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'site-theme';
const THEME_COLORS = { dark: '#0b0c0e', light: '#f3f5f7' };
const listeners = new Set();
const mediaQuery = () => window.matchMedia('(prefers-color-scheme: dark)');

function readStoredTheme() {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === 'dark' || value === 'light' ? value : null;
  } catch {
    return null;
  }
}

let chosenTheme = typeof window === 'undefined' ? null : readStoredTheme();

function systemTheme() {
  return mediaQuery().matches ? 'dark' : 'light';
}

function currentTheme() {
  return chosenTheme || systemTheme();
}

function applyTheme(animate = false) {
  const theme = currentTheme();
  const root = document.documentElement;
  if (animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.classList.add('theme-transition');
    window.setTimeout(() => root.classList.remove('theme-transition'), 250);
  }
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme]);
}

if (typeof document !== 'undefined') applyTheme();

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  const media = mediaQuery();
  const onSystemChange = () => {
    if (!chosenTheme) {
      applyTheme(true);
      notify();
    }
  };
  media.addEventListener('change', onSystemChange);
  return () => {
    listeners.delete(listener);
    media.removeEventListener('change', onSystemChange);
  };
}

function snapshot() {
  return `${currentTheme()}:${chosenTheme ? 'chosen' : 'system'}`;
}

export function setTheme(nextTheme) {
  chosenTheme = nextTheme === 'dark' || nextTheme === 'light' ? nextTheme : null;
  try {
    if (chosenTheme) window.localStorage.setItem(STORAGE_KEY, chosenTheme);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // The setting still applies for this visit when storage is unavailable.
  }
  applyTheme(true);
  notify();
}

export function useTheme() {
  const [theme, preference] = useSyncExternalStore(
    subscribe,
    snapshot,
    () => 'dark:system'
  ).split(':');

  return {
    theme,
    followsSystem: preference === 'system',
    toggle: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    matchSystem: () => setTheme(null)
  };
}
