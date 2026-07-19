import { useEffect } from 'react';

// ─── Global keyboard shortcut handler ────────────────────────────────────────

export interface Shortcut {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  /** Prevent default browser action */
  preventDefault?: boolean;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrlOrMeta = e.ctrlKey || e.metaKey;

      for (const shortcut of shortcuts) {
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl || shortcut.meta ? ctrlOrMeta : !shortcut.ctrl && !shortcut.meta;
        const shiftMatch = shortcut.shift ? e.shiftKey : !shortcut.shift || !e.shiftKey;
        const altMatch = shortcut.alt ? e.altKey : !shortcut.alt;

        // Looser shift match: if shortcut doesn't specify shift, ignore shift state
        const shiftOk = shortcut.shift ? e.shiftKey : (shortcut.shift === false ? !e.shiftKey : true);

        if (keyMatch && ctrlMatch && shiftOk && altMatch) {
          if (shortcut.preventDefault !== false) e.preventDefault();
          shortcut.action();
          return;
        }
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [shortcuts]);
}
