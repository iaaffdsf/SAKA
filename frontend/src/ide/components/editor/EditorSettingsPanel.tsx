/**
 * Editor settings panel — slides in over the editor area.
 * Controlled by a boolean prop; caller manages open/close state.
 */
import { X, RotateCcw } from 'lucide-react';
import { cn } from '@/utilities/cn.js';
import {
  useEditorSettings,
  AUTO_SAVE_OPTIONS,
  FONT_FAMILY_OPTIONS,
} from '@/ide/contexts/EditorSettingsContext.js';
import { useTheme } from '@/ide/contexts/ThemeContext.js';
import type { Theme } from '@/ide/types/ide.js';

// ─── Props ────────────────────────────────────────────────────────────────────

interface EditorSettingsPanelProps {
  onClose(): void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3
        className="text-[10px] font-semibold uppercase tracking-widest mb-3 px-1"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {title}
      </h3>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm flex-shrink-0" style={{ color: 'var(--color-text-secondary)' }}>
        {label}
      </span>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

const selectCls = cn(
  'text-xs rounded-md px-2 py-1.5 outline-none appearance-none',
  'border transition-colors',
);
const selectStyle = {
  background: 'var(--color-surface)',
  color:      'var(--color-text-primary)',
  border:     '1px solid var(--color-border)',
};

function Select<T extends string | number>({
  value,
  onChange,
  options,
  style,
}: {
  value: T;
  onChange(v: T): void;
  options: readonly { label: string; value: T }[];
  style?: React.CSSProperties;
}) {
  return (
    <select
      className={selectCls}
      style={{ ...selectStyle, ...style }}
      value={String(value)}
      onChange={(e) => {
        const raw = e.target.value;
        const num = Number(raw);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange((Number.isNaN(num) ? raw : num) as any);
      }}
    >
      {options.map((o) => (
        <option key={String(o.value)} value={String(o.value)}>{o.label}</option>
      ))}
    </select>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange(v: boolean): void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-5 w-9 rounded-full transition-colors duration-200',
        checked ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]',
      )}
    >
      <span
        className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200"
        style={{ transform: checked ? 'translateX(16px)' : 'translateX(0)' }}
      />
    </button>
  );
}

// ─── Panel ───────────────────────────────────────────────────────────────────

export default function EditorSettingsPanel({ onClose }: EditorSettingsPanelProps) {
  const { settings, updateSetting, resetSettings } = useEditorSettings();
  const { theme, setTheme } = useTheme();

  const fontSizes = [11, 12, 13, 14, 15, 16, 18, 20].map((n) => ({
    label: String(n),
    value: n,
  }));

  const themeOptions: { label: string; value: Theme }[] = [
    { label: 'Dark',     value: 'dark'     },
    { label: 'Midnight', value: 'midnight' },
    { label: 'Light',    value: 'light'    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="absolute inset-0 z-30"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <aside
        className="absolute top-0 right-0 bottom-0 z-40 flex flex-col overflow-hidden"
        style={{
          width:        340,
          background:   'var(--color-surface)',
          borderLeft:   '1px solid var(--color-border)',
          boxShadow:    '-4px 0 24px rgba(0,0,0,0.4)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
        >
          <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Editor Settings
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={resetSettings}
              title="Reset to defaults"
              className="p-1.5 rounded hover:bg-white/10 transition-colors text-xs flex items-center gap-1"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-white/10 transition-colors"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 py-4">

          {/* ── Appearance ──────────────────────────────────────────────────── */}
          <Section title="Appearance">
            <Row label="Theme">
              <Select
                value={theme}
                onChange={(v) => setTheme(v as Theme)}
                options={themeOptions}
                style={{ width: 140 }}
              />
            </Row>

            <Row label="Font Family">
              <Select
                value={settings.fontFamily}
                onChange={(v) => updateSetting('fontFamily', v)}
                options={FONT_FAMILY_OPTIONS}
                style={{ width: 140 }}
              />
            </Row>

            <Row label="Font Size">
              <Select
                value={settings.fontSize}
                onChange={(v) => updateSetting('fontSize', v)}
                options={fontSizes}
                style={{ width: 80 }}
              />
            </Row>

            <Row label="Minimap">
              <Toggle
                checked={settings.minimap}
                onChange={(v) => updateSetting('minimap', v)}
              />
            </Row>

            <Row label="Line Numbers">
              <Select
                value={settings.lineNumbers}
                onChange={(v) => updateSetting('lineNumbers', v as 'on' | 'off' | 'relative')}
                options={[
                  { label: 'On',       value: 'on'       as const },
                  { label: 'Relative', value: 'relative' as const },
                  { label: 'Off',      value: 'off'      as const },
                ]}
                style={{ width: 100 }}
              />
            </Row>

            <Row label="Word Wrap">
              <Toggle
                checked={settings.wordWrap === 'on'}
                onChange={(v) => updateSetting('wordWrap', v ? 'on' : 'off')}
              />
            </Row>

            <Row label="Render Whitespace">
              <Select
                value={settings.renderWhitespace}
                onChange={(v) => updateSetting('renderWhitespace', v as 'none' | 'boundary' | 'all')}
                options={[
                  { label: 'None',     value: 'none'     as const },
                  { label: 'Boundary', value: 'boundary' as const },
                  { label: 'All',      value: 'all'      as const },
                ]}
                style={{ width: 110 }}
              />
            </Row>
          </Section>

          {/* ── Editing ──────────────────────────────────────────────────────── */}
          <Section title="Editing">
            <Row label="Tab Size">
              <Select
                value={settings.tabSize}
                onChange={(v) => updateSetting('tabSize', v)}
                options={[
                  { label: '2 spaces', value: 2 },
                  { label: '4 spaces', value: 4 },
                  { label: '8 spaces', value: 8 },
                ]}
                style={{ width: 110 }}
              />
            </Row>

            <Row label="Bracket Colors">
              <Toggle
                checked={settings.bracketPairColorization}
                onChange={(v) => updateSetting('bracketPairColorization', v)}
              />
            </Row>

            <Row label="Linked Editing">
              <Toggle
                checked={settings.linkedEditing}
                onChange={(v) => updateSetting('linkedEditing', v)}
              />
            </Row>

            <Row label="Inlay Hints">
              <Toggle
                checked={settings.inlayHints}
                onChange={(v) => updateSetting('inlayHints', v)}
              />
            </Row>

            <Row label="Format on Save">
              <Toggle
                checked={settings.formatOnSave}
                onChange={(v) => updateSetting('formatOnSave', v)}
              />
            </Row>

            <Row label="Sticky Scroll">
              <Toggle
                checked={settings.stickyScroll}
                onChange={(v) => updateSetting('stickyScroll', v)}
              />
            </Row>
          </Section>

          {/* ── Cursor ───────────────────────────────────────────────────────── */}
          <Section title="Cursor">
            <Row label="Cursor Style">
              <Select
                value={settings.cursorStyle}
                onChange={(v) => updateSetting('cursorStyle', v as 'line' | 'block' | 'underline')}
                options={[
                  { label: 'Line',      value: 'line'      as const },
                  { label: 'Block',     value: 'block'     as const },
                  { label: 'Underline', value: 'underline' as const },
                ]}
                style={{ width: 110 }}
              />
            </Row>

            <Row label="Cursor Blink">
              <Select
                value={settings.cursorBlinking}
                onChange={(v) => updateSetting('cursorBlinking', v as 'blink' | 'smooth' | 'phase' | 'expand' | 'solid')}
                options={[
                  { label: 'Smooth',  value: 'smooth'  as const },
                  { label: 'Blink',   value: 'blink'   as const },
                  { label: 'Phase',   value: 'phase'   as const },
                  { label: 'Expand',  value: 'expand'  as const },
                  { label: 'Solid',   value: 'solid'   as const },
                ]}
                style={{ width: 110 }}
              />
            </Row>

            <Row label="Smooth Scroll">
              <Toggle
                checked={settings.smoothScrolling}
                onChange={(v) => updateSetting('smoothScrolling', v)}
              />
            </Row>
          </Section>

          {/* ── Saving ───────────────────────────────────────────────────────── */}
          <Section title="Saving">
            <Row label="Auto Save">
              <Select
                value={settings.autoSaveDelay}
                onChange={(v) => updateSetting('autoSaveDelay', v)}
                options={[...AUTO_SAVE_OPTIONS]}
                style={{ width: 100 }}
              />
            </Row>
          </Section>

          {/* Keyboard shortcuts hint */}
          <div
            className="mt-2 rounded-lg p-3 text-xs space-y-1.5"
            style={{
              background: 'var(--color-background)',
              border:     '1px solid var(--color-border-subtle)',
              color:      'var(--color-text-muted)',
            }}
          >
            <p className="font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              Keyboard Shortcuts
            </p>
            {[
              ['Ctrl+S',           'Save file'],
              ['Ctrl+Shift+A',     'Toggle AI panel'],
              ['Ctrl+B',           'Toggle sidebar'],
              ['Ctrl+J',           'Toggle terminal'],
              ['Ctrl+P / Ctrl+Shift+P', 'Command palette'],
              ['Shift+Alt+F',      'Format document'],
              ['F12',              'Go to definition'],
              ['Shift+F12',        'Find references'],
              ['F2',               'Rename symbol'],
              ['Ctrl+F',           'Find'],
              ['Ctrl+H',           'Find & replace'],
              ['Ctrl+/',           'Toggle comment'],
              ['Alt+Click',        'Multi-cursor'],
              ['Ctrl+G',           'Go to line'],
            ].map(([key, desc]) => (
              <div key={key} className="flex justify-between gap-2">
                <span className="font-mono text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>{key}</span>
                <span className="text-[10px]">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
