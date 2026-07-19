/**
 * Monaco Editor theme registration.
 * Uses the default @monaco-editor/react CDN loader — no manual worker setup needed.
 */
import { loader } from '@monaco-editor/react';

loader.init().then((m) => {

  // ── AI IDE Dark (One Dark-inspired) ─────────────────────────────────────────
  m.editor.defineTheme('ai-ide-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment',                foreground: '5c6370', fontStyle: 'italic' },
      { token: 'keyword',                foreground: 'c678dd' },
      { token: 'string',                 foreground: '98c379' },
      { token: 'number',                 foreground: 'd19a66' },
      { token: 'type',                   foreground: 'e5c07b' },
      { token: 'class',                  foreground: 'e5c07b' },
      { token: 'function',               foreground: '61afef' },
      { token: 'variable',               foreground: 'abb2bf' },
      { token: 'variable.parameter',     foreground: 'abb2bf', fontStyle: 'italic' },
      { token: 'entity.name.function',   foreground: '61afef' },
      { token: 'entity.name.type',       foreground: 'e5c07b' },
      { token: 'entity.name.tag',        foreground: 'e06c75' },
      { token: 'entity.other.attribute', foreground: 'd19a66' },
      { token: 'support.function',       foreground: '56b6c2' },
      { token: 'operator',               foreground: '56b6c2' },
      { token: 'tag',                    foreground: 'e06c75' },
      { token: 'attribute.name',         foreground: 'd19a66' },
      { token: 'attribute.value',        foreground: '98c379' },
    ],
    colors: {
      'editor.background':                    '#0c0c0f',
      'editor.foreground':                    '#abb2bf',
      'editor.lineHighlightBackground':       '#18181b60',
      'editor.lineHighlightBorder':           '#00000000',
      'editor.selectionBackground':           '#3e445180',
      'editor.inactiveSelectionBackground':   '#3a3a3a50',
      'editor.findMatchBackground':           '#6366f150',
      'editor.findMatchHighlightBackground':  '#6366f125',
      'editorCursor.foreground':              '#6366f1',
      'editorLineNumber.foreground':          '#3b4048',
      'editorLineNumber.activeForeground':    '#636d83',
      'editorIndentGuide.background1':        '#3b404880',
      'editorIndentGuide.activeBackground1':  '#3b4048',
      'editorGutter.background':              '#0c0c0f',
      'editorBracketMatch.background':        '#6366f120',
      'editorBracketMatch.border':            '#6366f160',
      'scrollbarSlider.background':           '#3f3f4630',
      'scrollbarSlider.hoverBackground':      '#3f3f4660',
      'scrollbarSlider.activeBackground':     '#3f3f4690',
      'minimap.background':                   '#09090b',
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
      'list.hoverBackground':                 '#27272a',
      'list.activeSelectionBackground':       '#3f3f46',
      'peekViewEditor.background':            '#0c0c0f',
      'peekViewResult.background':            '#09090b',
    },
  });

  // ── AI IDE Midnight ─────────────────────────────────────────────────────────
  m.editor.defineTheme('ai-ide-midnight', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment',  foreground: '4a4a7a', fontStyle: 'italic' },
      { token: 'keyword',  foreground: '9d8fff' },
      { token: 'string',   foreground: '7aecb5' },
      { token: 'number',   foreground: 'ff9d54' },
      { token: 'type',     foreground: 'f0c67a' },
      { token: 'function', foreground: '7eb8ff' },
      { token: 'operator', foreground: '7c6fff' },
      { token: 'tag',      foreground: 'f07178' },
    ],
    colors: {
      'editor.background':                 '#020209',
      'editor.foreground':                 '#e8e8f5',
      'editor.lineHighlightBackground':    '#0a0a1450',
      'editor.selectionBackground':        '#1e1e3a',
      'editor.findMatchBackground':        '#7c6fff40',
      'editorCursor.foreground':           '#7c6fff',
      'editorLineNumber.foreground':       '#1e1e3a',
      'editorLineNumber.activeForeground': '#5a5a8a',
      'editorGutter.background':           '#020209',
      'scrollbarSlider.background':        '#1e1e3a40',
      'scrollbarSlider.hoverBackground':   '#1e1e3a80',
      'minimap.background':                '#020209',
      'editorWidget.background':           '#0a0a14',
      'editorWidget.border':               '#1e1e3a',
      'editorSuggestWidget.background':    '#0a0a14',
      'editorSuggestWidget.border':        '#1e1e3a',
      'editorSuggestWidget.selectedBackground': '#12121f',
      'editorSuggestWidget.highlightForeground': '#7c6fff',
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
      'editor.background':                 '#ffffff',
      'editor.foreground':                 '#24292e',
      'editor.lineHighlightBackground':    '#f6f8fa',
      'editorCursor.foreground':           '#4f46e5',
      'editorLineNumber.foreground':       '#bbbfc4',
      'editorLineNumber.activeForeground': '#24292e',
      'editorGutter.background':           '#ffffff',
      'editorSuggestWidget.highlightForeground': '#4f46e5',
      'minimap.background':                '#f6f8fa',
    },
  });

}).catch(console.error);

export {};
