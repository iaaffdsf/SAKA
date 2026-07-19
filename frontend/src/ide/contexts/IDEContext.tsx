import {
  createContext, useContext, useCallback, useState, useEffect, type ReactNode,
} from 'react';
import { useLocalStorage } from '@/ide/hooks/useLocalStorage.js';
import type { IDEState, ActivityBarTab, EditorTab, OpenFile, CursorPosition } from '@/ide/types/ide.js';
import type { FileEntry, WorkspaceProject } from '@workspace/shared';
import { getLanguage } from '@/ide/utilities/language.js';

// ─── Session persistence shape (no content stored — loaded fresh from disk) ───

interface SerializedTab {
  id:       string;
  name:     string;
  path:     string;
  language: string;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_SIDEBAR_WIDTH   = 260;
const DEFAULT_AI_PANEL_WIDTH  = 340;
const DEFAULT_TERMINAL_HEIGHT = 200;

// ─── Context ──────────────────────────────────────────────────────────────────

interface IDEStateExtended extends IDEState {
  cursorPosition: CursorPosition | null;
  setCursorPosition(pos: CursorPosition | null): void;
}

const IDEContext = createContext<IDEStateExtended | null>(null);

export function IDEProvider({ children }: { children: ReactNode }) {
  // ── Panel visibility ────────────────────────────────────────────────────────
  const [sidebarOpen,        setSidebarOpen]   = useLocalStorage('ide-sidebar-open', true);
  const [aiPanelOpen,        setAIPanelOpen]   = useLocalStorage('ide-ai-open',      true);
  const [terminalOpen,       setTerminalOpen]  = useLocalStorage('ide-terminal-open',true);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // ── Panel sizes ─────────────────────────────────────────────────────────────
  const [sidebarWidth,   setSidebarWidth]   = useLocalStorage('ide-sidebar-w',  DEFAULT_SIDEBAR_WIDTH);
  const [aiPanelWidth,   setAIPanelWidth]   = useLocalStorage('ide-ai-w',       DEFAULT_AI_PANEL_WIDTH);
  const [terminalHeight, setTerminalHeight] = useLocalStorage('ide-terminal-h', DEFAULT_TERMINAL_HEIGHT);

  // ── Activity / editor tabs ──────────────────────────────────────────────────
  const [activeActivityTab, setActiveActivityTab] = useState<ActivityBarTab>('files');
  const [activeEditorTab,   setActiveEditorTab]   = useState<EditorTab>('editor');

  // ── Cursor position (updated by MonacoEditor, read by StatusBar) ────────────
  const [cursorPosition, setCursorPosition] = useState<CursorPosition | null>(null);

  // ── Active project ──────────────────────────────────────────────────────────
  const [activeProject, setActiveProject] = useState<WorkspaceProject | null>(null);

  // ── Session-persisted open files ────────────────────────────────────────────
  // Persist only metadata (no content) — content is loaded fresh from disk.
  const [sessionTabs,   setSessionTabs]   = useLocalStorage<SerializedTab[]>('ide-session-tabs',   []);
  const [sessionActive, setSessionActive] = useLocalStorage<string | null>  ('ide-session-active', null);

  // Hydrate open files from session on mount
  const [openFiles,    setOpenFiles]    = useState<OpenFile[]>(() =>
    sessionTabs.map((t) => ({
      id:       t.id,
      name:     t.name,
      path:     t.path,
      language: t.language,
      isDirty:  false,       // session-restored files are always clean
      content:  undefined,   // loaded lazily from disk
    })),
  );
  const [activeFileId, setActiveFileId] = useState<string | null>(() =>
    sessionActive && sessionTabs.some((t) => t.id === sessionActive)
      ? sessionActive
      : (sessionTabs[0]?.id ?? null),
  );

  // Persist session whenever open files or active file changes
  useEffect(() => {
    setSessionTabs(
      openFiles.map((f): SerializedTab => ({
        id: f.id, name: f.name, path: f.path, language: f.language,
      })),
    );
  }, [openFiles, setSessionTabs]);

  useEffect(() => {
    setSessionActive(activeFileId);
  }, [activeFileId, setSessionActive]);

  // ── Unsaved-changes warning on page unload ──────────────────────────────────
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (openFiles.some((f) => f.isDirty)) {
        e.preventDefault();
        // returnValue is required by some browsers for the dialog to appear
        e.returnValue = 'You have unsaved changes. Leave anyway?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [openFiles]);

  // ── Actions ─────────────────────────────────────────────────────────────────

  const toggleSidebar  = useCallback(() => setSidebarOpen((v) => !v),  [setSidebarOpen]);
  const toggleAIPanel  = useCallback(() => setAIPanelOpen((v) => !v),  [setAIPanelOpen]);
  const toggleTerminal = useCallback(() => setTerminalOpen((v) => !v), [setTerminalOpen]);

  const openCommandPalette  = useCallback(() => setCommandPaletteOpen(true),  []);
  const closeCommandPalette = useCallback(() => setCommandPaletteOpen(false), []);

  const openFile = useCallback((file: FileEntry) => {
    if (file.type === 'folder') return;
    setOpenFiles((prev) => {
      if (prev.find((f) => f.id === file.id)) {
        setActiveFileId(file.id);
        return prev;
      }
      const lang = getLanguage(file.name);
      const next: OpenFile = {
        id:       file.id,
        name:     file.name,
        path:     file.path,
        language: lang,
        isDirty:  false,
        content:  undefined,
      };
      setActiveFileId(file.id);
      return [...prev, next];
    });
    setActiveEditorTab('editor');
  }, []);

  const closeFile = useCallback((id: string) => {
    setOpenFiles((prev) => {
      const idx  = prev.findIndex((f) => f.id === id);
      const next = prev.filter((f) => f.id !== id);
      setActiveFileId((current) => {
        if (current !== id) return current;
        if (next.length === 0) return null;
        return next[Math.min(idx, next.length - 1)]?.id ?? null;
      });
      return next;
    });
    // Clear cursor position when last file is closed
    setCursorPosition(null);
  }, []);

  const setActiveFile = useCallback((id: string) => {
    setActiveFileId(id);
    setCursorPosition(null); // reset until Monaco reports position
  }, []);

  const updateFileContent = useCallback((id: string, content: string, isDirty = true) => {
    setOpenFiles((prev) =>
      prev.map((f) => f.id === id ? { ...f, content, isDirty } : f),
    );
  }, []);

  return (
    <IDEContext.Provider
      value={{
        sidebarOpen,
        aiPanelOpen,
        terminalOpen,
        commandPaletteOpen,
        sidebarWidth,
        aiPanelWidth,
        terminalHeight,
        activeActivityTab,
        activeEditorTab,
        openFiles,
        activeFileId,
        activeProject,
        cursorPosition,
        toggleSidebar,
        toggleAIPanel,
        toggleTerminal,
        openCommandPalette,
        closeCommandPalette,
        setSidebarWidth,
        setAIPanelWidth,
        setTerminalHeight,
        setActiveActivityTab,
        setActiveEditorTab,
        setActiveProject,
        openFile,
        closeFile,
        setActiveFile,
        updateFileContent,
        setCursorPosition,
      }}
    >
      {children}
    </IDEContext.Provider>
  );
}

export function useIDE() {
  const ctx = useContext(IDEContext);
  if (!ctx) throw new Error('useIDE must be used inside <IDEProvider>');
  return ctx;
}
