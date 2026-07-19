import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useLocalStorage } from '@/ide/hooks/useLocalStorage.js';
import type { Theme } from '@/ide/types/ide.js';

// ─── Theme definitions ────────────────────────────────────────────────────────

interface ThemeVars {
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  borderSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentHover: string;
  accentSubtle: string;
}

const THEMES: Record<Theme, ThemeVars> = {
  dark: {
    background:      '#09090b',
    surface:         '#18181b',
    surfaceElevated: '#27272a',
    border:          '#3f3f46',
    borderSubtle:    '#27272a',
    textPrimary:     '#fafafa',
    textSecondary:   '#a1a1aa',
    textMuted:       '#71717a',
    accent:          '#6366f1',
    accentHover:     '#818cf8',
    accentSubtle:    '#312e81',
  },
  midnight: {
    background:      '#020209',
    surface:         '#0a0a14',
    surfaceElevated: '#12121f',
    border:          '#1e1e3a',
    borderSubtle:    '#12121f',
    textPrimary:     '#e8e8f5',
    textSecondary:   '#9898be',
    textMuted:       '#5a5a8a',
    accent:          '#7c6fff',
    accentHover:     '#9d8fff',
    accentSubtle:    '#1a1447',
  },
  light: {
    background:      '#ffffff',
    surface:         '#f4f4f5',
    surfaceElevated: '#e4e4e7',
    border:          '#d4d4d8',
    borderSubtle:    '#e4e4e7',
    textPrimary:     '#09090b',
    textSecondary:   '#52525b',
    textMuted:       '#71717a',
    accent:          '#4f46e5',
    accentHover:     '#4338ca',
    accentSubtle:    '#e0e7ff',
  },
};

// ─── Context ──────────────────────────────────────────────────────────────────

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  themes: Theme[];
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useLocalStorage<Theme>('ide-theme', 'dark');

  useEffect(() => {
    const vars = THEMES[theme];
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.style.setProperty('--color-background',       vars.background);
    root.style.setProperty('--color-surface',          vars.surface);
    root.style.setProperty('--color-surface-elevated', vars.surfaceElevated);
    root.style.setProperty('--color-border',           vars.border);
    root.style.setProperty('--color-border-subtle',    vars.borderSubtle);
    root.style.setProperty('--color-text-primary',     vars.textPrimary);
    root.style.setProperty('--color-text-secondary',   vars.textSecondary);
    root.style.setProperty('--color-text-muted',       vars.textMuted);
    root.style.setProperty('--color-accent',           vars.accent);
    root.style.setProperty('--color-accent-hover',     vars.accentHover);
    root.style.setProperty('--color-accent-subtle',    vars.accentSubtle);
    // color-scheme for native scrollbar/inputs
    root.style.colorScheme = theme === 'light' ? 'light' : 'dark';
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: ['dark', 'midnight', 'light'] }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
