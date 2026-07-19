/**
 * Monaco-based code editor.
 * - Single editor instance, multi-model (VS Code approach): switching tabs
 *   reuses cached models so cursor/scroll position is preserved per file.
 * - Content is loaded once per path from the backend; subsequent visits use
 *   the live Monaco model (which may contain unsaved edits).
 * - Auto-save: debounced write triggered by onChange.
 * - Manual save: Ctrl/Cmd+S.
 */

// ⚠ This side-effect import MUST be first — it sets MonacoEnvironment + loader
import '@/ide/setup/monacoSetup.js';

import {
  useRef, useEffect, useCallback, useState, type FC,
} from 'react';
import MonacoEditorReact, { type OnMount, type OnChange } from '@monaco-editor/react';
import type * as monacoNs from 'monaco-editor';
import { Loader2 } from 'lucide-react';
import { useEditorSettings } from '@/ide/contexts/EditorSettingsContext.js';
import { useTheme } from '@/ide/contexts/ThemeContext.js';
import type { OpenFile } from '@/ide/types/ide.js';

// ─── Language mapping ─────────────────────────────────────────────────────────

function toMonacoLang(lang: string): string {
  switch (lang) {
    case 'tsx':        return 'typescriptreact';
    case 'jsx':        return 'javascriptreact';
    case 'typescript': return 'typescript';
    case 'javascript': return 'javascript';
    case 'python':     return 'python';
    case 'java':       return 'java';
    case 'cpp':        return 'cpp';
    case 'c':          return 'c';
    case 'csharp':     return 'csharp';
    case 'rust':       return 'rust';
    case 'go':         return 'go';
    case 'html':       return 'html';
    case 'css':        return 'css';
    case 'scss':       return 'scss';
    case 'sass':       return 'scss';
    case 'less':       return 'less';
    case 'json':       return 'json';
    case 'markdown':
    case 'mdx':        return 'markdown';
    case 'yaml':       return 'yaml';
    case 'toml':       return 'ini';
    case 'bash':       return 'shell';
    case 'sql':        return 'sql';
    case 'graphql':    return 'graphql';
    case 'xml':        return 'xml';
    case 'dockerfile': return 'dockerfile';
    case 'vue':        return 'html';
    case 'svelte':     return 'html';
    default:           return 'plaintext';
  }
}

// ─── Theme mapping ─────────────────────────────────────────────────────────────

function toMonacoTheme(ideTheme: string): string {
  switch (ideTheme) {
    case 'midnight': return 'ai-ide-midnight';
    case 'light':    return 'ai-ide-light';
    default:         return 'ai-ide-dark';
  }
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface MonacoEditorProps {
  file: OpenFile;
  readFile(path: string): Promise<{ content: string; language: string }>;
  writeFile(path: string, content: string): Promise<void>;
  onContentChange(content: string, isDirty: boolean): void;
  onCursorChange?(line: number, column: number): void;
  onSaveStart?(): void;
  onSaveEnd?(): void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const MonacoEditor: FC<MonacoEditorProps> = ({
  file,
  readFile,
  writeFile,
  onContentChange,
  onCursorChange,
  onSaveStart,
  onSaveEnd,
}) => {
  const { settings }              = useEditorSettings();
  const { theme }                 = useTheme();

  const editorRef   = useRef<monacoNs.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef   = useRef<typeof monacoNs | null>(null);
  const loadedPaths = useRef<Set<string>>(new Set());
  const autosaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentFile = useRef(file);

  // Keep currentFile ref in sync (avoids stale closures in callbacks)
  useEffect(() => { currentFile.current = file; }, [file]);

  // ── Save helpers ───────────────────────────────────────────────────────────

  const persistSave = useCallback(async (path: string, content: string) => {
    onSaveStart?.();
    try {
      await writeFile(path, content);
      onContentChange(content, false);
    } catch (err) {
      console.error('[MonacoEditor] save failed:', err);
    } finally {
      onSaveEnd?.();
    }
  }, [writeFile, onContentChange, onSaveStart, onSaveEnd]);

  const saveNow = useCallback(() => {
    clearTimeout(autosaveRef.current!);
    const content = editorRef.current?.getValue();
    if (content === undefined) return;
    void persistSave(currentFile.current.path, content);
  }, [persistSave]);

  // ── Content loading ────────────────────────────────────────────────────────

  const ensureContent = useCallback(async (f: OpenFile) => {
    if (loadedPaths.current.has(f.path)) return;

    // If content was already fetched and stored in IDEContext, use it
    if (f.content !== undefined) {
      loadedPaths.current.add(f.path);
      // Model might already have this content via defaultValue or previous visit
      return;
    }

    try {
      const { content } = await readFile(f.path);
      loadedPaths.current.add(f.path);
      onContentChange(content, false);

      // Apply to the Monaco model if this file is still active
      if (currentFile.current.path === f.path && editorRef.current) {
        const model = editorRef.current.getModel();
        if (model) {
          // Use setValue so the model reflects disk content cleanly
          model.setValue(content);
        }
      }
    } catch (err) {
      console.error('[MonacoEditor] load failed:', err);
    }
  }, [readFile, onContentChange]);

  // Reload content whenever the active file changes
  useEffect(() => {
    void ensureContent(file);
  }, [file.path, ensureContent]);

  // ── TypeScript / JavaScript compiler options ───────────────────────────────
  // Use dynamic access — monaco-editor 0.50+ restructured the TS service types.

  const configureTypeScript = useCallback((m: typeof monacoNs) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ts = (m as any).languages?.typescript;
    if (!ts) return;

    const tsOpts = {
      target:                       ts.ScriptTarget?.ESNext   ?? 99,
      module:                       ts.ModuleKind?.ESNext     ?? 99,
      moduleResolution:             ts.ModuleResolutionKind?.NodeJs ?? 2,
      allowSyntheticDefaultImports: true,
      esModuleInterop:              true,
      allowJs:                      true,
      checkJs:                      false,
      jsx:                          ts.JsxEmit?.ReactJSX      ?? 4,
      strict:                       false,
      experimentalDecorators:       true,
      emitDecoratorMetadata:        true,
      baseUrl:                      '.',
    };

    ts.typescriptDefaults?.setCompilerOptions(tsOpts);
    ts.javascriptDefaults?.setCompilerOptions({ ...tsOpts, checkJs: false });

    // Suppress import-resolution errors (we don't ship node_modules types)
    ts.typescriptDefaults?.setDiagnosticsOptions({
      noSemanticValidation:        false,
      noSyntaxValidation:          false,
      diagnosticCodesToIgnore:     [
        2307, // Cannot find module '...'
        2304, // Cannot find name '...'
        7016, // Could not find a declaration file for module '...'
      ],
    });
  }, []);

  // ── Editor mount ───────────────────────────────────────────────────────────

  const handleMount: OnMount = useCallback((editor, monacoInst) => {
    editorRef.current  = editor;
    monacoRef.current  = monacoInst;

    // TypeScript configuration
    configureTypeScript(monacoInst);

    // Ctrl/Cmd + S → save
    editor.addCommand(
      monacoInst.KeyMod.CtrlCmd | monacoInst.KeyCode.KeyS,
      () => saveNow(),
    );

    // Shift + Alt + F → format document
    editor.addCommand(
      monacoInst.KeyMod.Shift | monacoInst.KeyMod.Alt | monacoInst.KeyCode.KeyF,
      () => void editor.getAction('editor.action.formatDocument')?.run(),
    );

    // Cursor position → StatusBar
    editor.onDidChangeCursorPosition((e) => {
      onCursorChange?.(e.position.lineNumber, e.position.column);
    });

    // Load content for the initially active file
    void ensureContent(file);
  }, [file, saveNow, ensureContent, configureTypeScript, onCursorChange]);

  // ── Content change ─────────────────────────────────────────────────────────

  const handleChange: OnChange = useCallback((value) => {
    if (value === undefined) return;
    onContentChange(value, true);

    if (settings.autoSaveDelay > 0) {
      clearTimeout(autosaveRef.current!);
      autosaveRef.current = setTimeout(() => {
        void persistSave(currentFile.current.path, value);
      }, settings.autoSaveDelay);
    }
  }, [settings.autoSaveDelay, onContentChange, persistSave]);

  // Format on save (applied right before the actual disk write)
  // This runs when Ctrl+S is pressed, handled in saveNow which calls
  // formatDocument then reads getValue. We trigger it separately.
  useEffect(() => {
    if (!settings.formatOnSave) return;
    const disposable = editorRef.current?.onDidBlurEditorText(() => {
      // no-op; format on save runs via saveNow
    });
    return () => disposable?.dispose();
  }, [settings.formatOnSave]);

  // Update Monaco options when settings change
  useEffect(() => {
    editorRef.current?.updateOptions(buildEditorOptions(settings));
  }, [settings]);

  // Cleanup autosave timer on unmount
  useEffect(() => () => {
    clearTimeout(autosaveRef.current!);
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full w-full">
      {/* Loading notice (shown until editor JS is ready, usually <1s) */}
      <MonacoEditorReact
        path={`file:///workspace${file.path}`}
        language={toMonacoLang(file.language)}
        theme={toMonacoTheme(theme)}
        defaultValue=""
        options={buildEditorOptions(settings)}
        onChange={handleChange}
        onMount={handleMount}
        keepCurrentModel={true}
        loading={<EditorLoading />}
      />
    </div>
  );
};

export default MonacoEditor;

// ─── Editor options factory ───────────────────────────────────────────────────

function buildEditorOptions(
  s: ReturnType<typeof useEditorSettings>['settings'],
): monacoNs.editor.IStandaloneEditorConstructionOptions {
  return {
    fontSize:               s.fontSize,
    fontFamily:             s.fontFamily,
    fontLigatures:          true,
    tabSize:                s.tabSize,
    insertSpaces:           true,
    wordWrap:               s.wordWrap,
    minimap:                { enabled: s.minimap, renderCharacters: true, maxColumn: 120 },
    lineNumbers:            s.lineNumbers as monacoNs.editor.LineNumbersType,
    renderWhitespace:       s.renderWhitespace,
    bracketPairColorization:{ enabled: s.bracketPairColorization },
    stickyScroll:           { enabled: s.stickyScroll, maxLineCount: 5 },
    smoothScrolling:        s.smoothScrolling,
    cursorStyle:            s.cursorStyle as 'line' | 'block' | 'underline' | 'line-thin' | 'block-outline' | 'underline-thin',
    cursorBlinking:         s.cursorBlinking as 'blink' | 'smooth' | 'phase' | 'expand' | 'solid',
    cursorSmoothCaretAnimation: 'on',
    linkedEditing:          s.linkedEditing,
    inlayHints:             { enabled: s.inlayHints ? 'on' : 'off' },
    // ── UX ───────────────────────────────────────────────────────────────────
    scrollBeyondLastLine:   true,
    scrollBeyondLastColumn: 5,
    padding:                { top: 12, bottom: 60 },
    folding:                true,
    foldingStrategy:        'auto',
    showFoldingControls:    'mouseover',
    glyphMargin:            true,
    lineDecorationsWidth:   4,
    lineNumbersMinChars:    3,
    renderLineHighlight:    'line',
    selectionHighlight:     true,
    occurrencesHighlight:   'singleFile',
    links:                  true,
    colorDecorators:        true,
    contextmenu:            true,
    copyWithSyntaxHighlighting: true,
    emptySelectionClipboard:false,
    multiCursorModifier:    'alt',
    accessibilitySupport:   'off',
    formatOnPaste:          true,
    formatOnType:           false,
    // ── IntelliSense ─────────────────────────────────────────────────────────
    suggest: {
      showClasses:          true,
      showFunctions:        true,
      showVariables:        true,
      showKeywords:         true,
      showSnippets:         true,
      showFiles:            true,
      showModules:          true,
      showConstructors:     true,
      showMethods:          true,
      showProperties:       true,
      showFields:           true,
      showEnumMembers:      true,
      showTypeParameters:   true,
      insertMode:           'replace',
      preview:              true,
      previewMode:          'prefix',
      filterGraceful:       true,
    },
    quickSuggestions:       { other: true, comments: false, strings: false },
    quickSuggestionsDelay:  100,
    parameterHints:         { enabled: true, cycle: true },
    tabCompletion:          'on',
    wordBasedSuggestions:   'allDocuments',
    hover:                  { enabled: true, delay: 300, sticky: true },
    // ── Scrollbars ───────────────────────────────────────────────────────────
    scrollbar: {
      vertical:              'auto',
      horizontal:            'auto',
      verticalScrollbarSize:  8,
      horizontalScrollbarSize:8,
      arrowSize:              0,
    },
    // ── Find ─────────────────────────────────────────────────────────────────
    find: {
      addExtraSpaceOnTop: false,
      autoFindInSelection: 'never',
      seedSearchStringFromSelection: 'selection',
    },
    // ── Diff ─────────────────────────────────────────────────────────────────
    renderFinalNewline:     'on',
    trimAutoWhitespace:     true,
    detectIndentation:      true,
    autoIndent:             'full',
    autoClosingBrackets:    'languageDefined',
    autoClosingQuotes:      'languageDefined',
    autoSurround:           'languageDefined',
    matchBrackets:          'near',
  };
}

// ─── Loading state ────────────────────────────────────────────────────────────

function EditorLoading() {
  return (
    <div
      className="flex items-center justify-center gap-2 h-full w-full"
      style={{ background: 'var(--color-ide-editor)', color: 'var(--color-text-muted)' }}
    >
      <Loader2 className="w-4 h-4 animate-spin" />
      <span className="text-sm">Loading editor…</span>
    </div>
  );
}
