const THEME_KEY = 'resumehai-theme';
const THEMES = ['light', 'dark', 'system'];

export function getStoredTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return THEMES.includes(stored) ? stored : 'system';
  } catch {
    return 'system';
  }
}

export function resolveTheme(theme) {
  if (theme === 'system') {
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme === 'dark' ? 'dark' : 'light';
}

export function applyTheme(theme) {
  const resolved = resolveTheme(theme);
  document.documentElement.dataset.theme = resolved;

  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) themeColor.setAttribute('content', resolved === 'dark' ? '#0b1220' : '#f0f9ff');

  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Private browsing can block storage; the theme still applies for this session.
  }

  return resolved;
}

export function initTheme() {
  applyTheme(getStoredTheme());
}
