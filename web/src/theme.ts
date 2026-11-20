export type AppTheme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'sdm-theme';

export function getAppTheme(): AppTheme {
  return localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
}

export function setAppTheme(theme: AppTheme): void {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  window.dispatchEvent(new Event('sdm-theme-change'));
}
