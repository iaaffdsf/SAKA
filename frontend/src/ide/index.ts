// ─── IDE public API ───────────────────────────────────────────────────────────

export { default as IDELayout }    from './components/layout/IDELayout.js';
export { IDEProvider, useIDE }     from './contexts/IDEContext.js';
export { ThemeProvider, useTheme } from './contexts/ThemeContext.js';
export type * from './types/ide.js';
