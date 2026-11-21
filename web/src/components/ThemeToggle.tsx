import React, { useEffect, useState } from 'react';
import { AppTheme, getAppTheme, setAppTheme } from '../theme';

interface ThemeToggleProps {
  contrast?: boolean;
  compact?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ contrast = false, compact = false }) => {
  const [theme, setTheme] = useState<AppTheme>(getAppTheme);
  const nextTheme = theme === 'light' ? 'dark' : 'light';

  useEffect(() => {
    const syncTheme = () => setTheme(getAppTheme());
    window.addEventListener('sdm-theme-change', syncTheme);
    return () => window.removeEventListener('sdm-theme-change', syncTheme);
  }, []);

  const toggleTheme = () => {
    setAppTheme(nextTheme);
    setTheme(nextTheme);
  };

  return (
    <button
      type="button"
      data-theme-contrast={contrast ? 'true' : undefined}
      onClick={toggleTheme}
      aria-label={`Switch to ${nextTheme} theme`}
      title={`Switch to ${nextTheme} theme`}
      className={`theme-toggle inline-flex min-h-10 items-center justify-center gap-2 rounded-full border px-3 text-xs font-semibold transition-colors ${
        contrast
          ? 'border-white/25 bg-black/30 text-white hover:bg-black/50'
          : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
      }`}
    >
      <span aria-hidden="true">{theme === 'light' ? '🌙' : '☀️'}</span>
      <span className={compact ? 'sr-only' : undefined}>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>
    </button>
  );
};
