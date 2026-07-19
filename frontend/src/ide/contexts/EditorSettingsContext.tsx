import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useLocalStorage } from '@/ide/hooks/useLocalStorage.js';

// ─── Settings shape ───────────────────────────────────────────────────────────

export interface EditorSettings {
  fontSize:               number;
  fontFamily:             string;
  tabSize:                number;
  wordWrap:               'on' | 'off';
  minimap:                boolean;
  lineNumbers:            'on' | 'off' | 'relative';
  autoSaveDelay:          number;   // 0 = disabled
  formatOnSave:           boolean;
  renderWhitespace:       'none' | 'boundary' | 'all';
  bracketPairColorization:boolean;
  stickyScroll:           boolean;
  smoothScrolling:        boolean;
  cursorStyle:            'line' | 'block' | 'underline';
  cursorBlinking:         'blink' | 'smooth' | 'phase' | 'expand' | 'solid';
  linkedEditing:          boolean;
  inlayHints:             boolean;
}

const DEFAULTS: EditorSettings = {
  fontSize:                13,
  fontFamily:              "'JetBrains Mono', 'Cascadia Code', 'Fira Code', 'Menlo', 'Consolas', monospace",
  tabSize:                 2,
  wordWrap:                'off',
  minimap:                 true,
  lineNumbers:             'on',
  autoSaveDelay:           1000,
  formatOnSave:            false,
  renderWhitespace:        'none',
  bracketPairColorization: true,
  stickyScroll:            false,
  smoothScrolling:         true,
  cursorStyle:             'line',
  cursorBlinking:          'smooth',
  linkedEditing:           true,
  inlayHints:              true,
};

// ─── Context ──────────────────────────────────────────────────────────────────

interface EditorSettingsContextValue {
  settings: EditorSettings;
  updateSetting<K extends keyof EditorSettings>(key: K, value: EditorSettings[K]): void;
  resetSettings(): void;
}

const EditorSettingsContext = createContext<EditorSettingsContextValue | null>(null);

export function EditorSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useLocalStorage<EditorSettings>('ide-editor-settings', DEFAULTS);

  const updateSetting = useCallback(<K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, [setSettings]);

  const resetSettings = useCallback(() => setSettings(DEFAULTS), [setSettings]);

  return (
    <EditorSettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </EditorSettingsContext.Provider>
  );
}

export function useEditorSettings() {
  const ctx = useContext(EditorSettingsContext);
  if (!ctx) throw new Error('useEditorSettings must be inside <EditorSettingsProvider>');
  return ctx;
}

// ─── Auto-save labels ─────────────────────────────────────────────────────────

export const AUTO_SAVE_OPTIONS = [
  { label: 'Off',   value: 0     },
  { label: '500 ms',value: 500   },
  { label: '1 s',   value: 1000  },
  { label: '2 s',   value: 2000  },
  { label: '5 s',   value: 5000  },
] as const;

export const FONT_FAMILY_OPTIONS = [
  { label: 'JetBrains Mono', value: "'JetBrains Mono', 'Cascadia Code', monospace" },
  { label: 'Fira Code',      value: "'Fira Code', 'JetBrains Mono', monospace"     },
  { label: 'Cascadia Code',  value: "'Cascadia Code', 'Consolas', monospace"       },
  { label: 'Menlo',          value: "'Menlo', 'Monaco', 'Courier New', monospace"  },
  { label: 'Consolas',       value: "'Consolas', 'Courier New', monospace"         },
  { label: 'Courier New',    value: "'Courier New', monospace"                     },
] as const;
