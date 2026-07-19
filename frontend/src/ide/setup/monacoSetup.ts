/**
 * Monaco Editor environment setup — must be imported before any monaco-editor usage.
 * Sets up Web Workers locally (no CDN) and registers custom IDE themes.
 */
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker   from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker    from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker   from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker     from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import { loader }   from '@monaco-editor/react';
import * as monaco  from 'monaco-editor';

// ─── Worker environment ────────────────────────────────────────────────────────

(self as unknown as { MonacoEnvironment: unknown }).MonacoEnvironment = {
  getWorker(_: unknown, label: string): Worker {
    if (label === 'json')                                         return new jsonWorker();
    if (label === 'css' || label === 'scss' || label === 'less') return new cssWorker();
    if (label === 'html' || label === 'handlebars')              return new htmlWorker();
    if (label === 'typescript' || label === 'javascript')        return new tsWorker();
    return new editorWorker();
  },
};

// Use locally bundled monaco (not CDN)
loader.config({ monaco });

// ─── Custom themes ─────────────────────────────────────────────────────────────

loader.init().then((m) => {

  // ── AI IDE Dark (One Dark-inspired) ─────────────────────────────────────────
  m.editor.defineTheme('ai-ide-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment',                  foreground: '5c6370', fontStyle: 'italic' },
      { token: 'comment.doc',              foreground: '5c6370', fontStyle: 'italic' },
      { token: 'keyword',                  foreground: 'c678dd' },
      { token: 'keyword.operator',         foreground: 'c678dd' },
      { token: 'keyword.control',          foreground: 'c678dd' },
      { token: 'string',                   foreground: '98c379' },
      { token: 'string.escape',            foreground: '56b6c2' },
      { token: 'number',                   foreground: 'd19a66' },
      { token: 'constant',                 foreground: 'd19a66' },
      { token: 'type',                     foreground: 'e5c07b' },
      { token: 'class',                    foreground: 'e5c07b' },
      { token: 'function',                 foreground: '61afef' },
      { token: 'variable',                 foreground: 'abb2bf' },
      { token: 'variable.parameter',       foreground: 'abb2bf', fontStyle: 'italic' },
      { token: 'entity.name.function',     foreground: '61afef' },
      { token: 'entity.name.type',         foreground: 'e5c07b' },
      { token: 'entity.name.tag',          foreground: 'e06c75' },
      { token: 'entity.other.attribute',   foreground: 'd19a66' },
      { token: 'support.function',         foreground: '56b6c2' },
      { token: 'support.type',             foreground: 'e5c07b' },
      { token: 'operator',                 foreground: '56b6c2' },
      { token: 'punctuation',              foreground: 'abb2bf' },
      { token: 'delimiter',                foreground: 'abb2bf' },
      { token: 'tag',                      foreground: 'e06c75' },
      { token: 'attribute.name',           foreground: 'd19a66' },
      { token: 'attribute.value',          foreground: '98c379' },
      { token: 'regexp',                   foreground: '98c379' },
    ],
    colors: {
      'editor.background':                    '#0c0c0f',
      'editor.foreground':                    '#abb2bf',
      'editor.lineHighlightBackground':       '#18181b60',
      'editor.lineHighlightBorder':           '#00000000',
      'editor.selectionBackground':           '#3e445180',
      'editor.inactiveSelectionBackground':   '#3a3a3a50',
      'editor.wordHighlightBackground':       '#3e445160',
      'editor.findMatchBackground':           '#6366f150',
      'editor.findMatchHighlightBackground':  '#6366f125',
      'editorCursor.foreground':              '#6366f1',
      'editorCursor.background':              '#0c0c0f',
      'editorLineNumber.foreground':          '#3b4048',
      'editorLineNumber.activeForeground':    '#636d83',
      'editorIndentGuide.background1':        '#3b404880',
      'editorIndentGuide.activeBackground1':  '#3b4048',
      'editorGutter.background':              '#0c0c0f',
      'editorBracketMatch.background':        '#6366f120',
      'editorBracketMatch.border':            '#6366f160',
      'editorRuler.foreground':               '#27272a',
      'editorOverviewRuler.border':           '#00000000',
      'editorError.foreground':               '#ef4444',
      'editorWarning.foreground':             '#f59e0b',
      'editorInfo.foreground':                '#3b82f6',
      'editorHint.foreground':                '#22c55e',
      'editorWhitespace.foreground':          '#3b4048',
      'scrollbar.shadow':                     '#00000060',
      'scrollbarSlider.background':           '#3f3f4630',
      'scrollbarSlider.hoverBackground':      '#3f3f4660',
      'scrollbarSlider.activeBackground':     '#3f3f4690',
      'minimap.background':                   '#09090b',
      'minimapSlider.background':             '#3f3f4630',
      'minimapSlider.hoverBackground':        '#3f3f4650',
      'minimapSlider.activeBackground':       '#3f3f4670',
      'editorWidget.background':              '#18181b',
      'editorWidget.border':                  '#3f3f46',
      'editorSuggestWidget.background':       '#18181b',
      'editorSuggestWidget.border':           '#3f3f46',
      'editorSuggestWidget.selectedBackground':'#27272a',
      'editorSuggestWidget.highlightForeground':'#6366f1',
      'editorHoverWidget.background':         '#18181b',
      'editorHoverWidget.border':             '#3f3f46',
      'input.background':                     '#09090b',
      'input.border':                         '#3f3f46',
      'input.foreground':                     '#fafafa',
      'inputOption.activeBorder':             '#6366f1',
      'dropdown.background':                  '#18181b',
      'dropdown.border':                      '#3f3f46',
      'list.hoverBackground':                 '#27272a',
      'list.activeSelectionBackground':       '#3f3f46',
      'breadcrumb.background':                '#0c0c0f',
      'breadcrumb.foreground':                '#71717a',
      'breadcrumb.focusForeground':           '#fafafa',
      'peekView.border':                      '#6366f1',
      'peekViewEditor.background':            '#0c0c0f',
      'peekViewResult.background':            '#09090b',
    },
  });

  // ── AI IDE Midnight (deep purple-tinted dark) ─────────────────────────────
  m.editor.defineTheme('ai-ide-midnight', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment',     foreground: '4a4a7a', fontStyle: 'italic' },
      { token: 'keyword',     foreground: '9d8fff' },
      { token: 'string',      foreground: '7aecb5' },
      { token: 'number',      foreground: 'ff9d54' },
      { token: 'type',        foreground: 'f0c67a' },
      { token: 'function',    foreground: '7eb8ff' },
      { token: 'variable',    foreground: 'e8e8f5' },
      { token: 'operator',    foreground: '7c6fff' },
      { token: 'tag',         foreground: 'f07178' },
      { token: 'attribute.name', foreground: 'ffd580' },
    ],
    colors: {
      'editor.background':                  '#020209',
      'editor.foreground':                  '#e8e8f5',
      'editor.lineHighlightBackground':     '#0a0a1450',
      'editor.selectionBackground':         '#1e1e3a',
      'editor.findMatchBackground':         '#7c6fff40',
      'editorCursor.foreground':            '#7c6fff',
      'editorLineNumber.foreground':        '#1e1e3a',
      'editorLineNumber.activeForeground':  '#5a5a8a',
      'editorGutter.background':            '#020209',
      'scrollbarSlider.background':         '#1e1e3a40',
      'scrollbarSlider.hoverBackground':    '#1e1e3a80',
      'minimap.background':                 '#020209',
      'editorWidget.background':            '#0a0a14',
      'editorWidget.border':                '#1e1e3a',
      'editorSuggestWidget.background':     '#0a0a14',
      'editorSuggestWidget.border':         '#1e1e3a',
      'editorSuggestWidget.selectedBackground': '#12121f',
      'editorSuggestWidget.highlightForeground': '#7c6fff',
      'editorHoverWidget.background':       '#0a0a14',
      'editorHoverWidget.border':           '#1e1e3a',
    },
  });

  // ── AI IDE Light ────────────────────────────────────────────────────────────
  m.editor.defineTheme('ai-ide-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6a737d', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'd73a49' },
      { token: 'string',  foreground: '032f62' },
      { token: 'number',  foreground: '005cc5' },
      { token: 'type',    foreground: '6f42c1' },
      { token: 'function',foreground: '6f42c1' },
    ],
    colors: {
      'editor.background':                  '#ffffff',
      'editor.foreground':                  '#24292e',
      'editor.lineHighlightBackground':     '#f6f8fa',
      'editorCursor.foreground':            '#4f46e5',
      'editorLineNumber.foreground':        '#bbbfc4',
      'editorLineNumber.activeForeground':  '#24292e',
      'editorGutter.background':            '#ffffff',
      'editorSuggestWidget.highlightForeground': '#4f46e5',
      'minimap.background':                 '#f6f8fa',
    },
  });

}).catch(console.error);

export {};
