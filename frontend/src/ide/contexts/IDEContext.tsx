import { createContext, useContext, useCallback, useState, type ReactNode } from 'react';
import { useLocalStorage } from '@/ide/hooks/useLocalStorage.js';
import type { IDEState, ActivityBarTab, EditorTab, OpenFile } from '@/ide/types/ide.js';
import type { FileEntry, WorkspaceProject } from '@workspace/shared';
import { getLanguage } from '@/ide/utilities/language.js';

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_SIDEBAR_WIDTH   = 260;
const DEFAULT_AI_PANEL_WIDTH  = 340;
const DEFAULT_TERMINAL_HEIGHT = 200;

// ─── Context ──────────────────────────────────────────────────────────────────

const IDEContext = createContext<IDEState | null>(null);

export function IDEProvider({ children }: { children: ReactNode }) {
  // Visibility
  const [sidebarOpen,        setSidebarOpen]        = useLocalStorage('ide-sidebar-open',  true);
  const [aiPanelOpen,        setAIPanelOpen]        = useLocalStorage('ide-ai-open',       true);
  const [terminalOpen,       setTerminalOpen]       = useLocalStorage('ide-terminal-open', true);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Sizes
  const [sidebarWidth,   setSidebarWidth]   = useLocalStorage('ide-sidebar-w',   DEFAULT_SIDEBAR_WIDTH);
  const [aiPanelWidth,   setAIPanelWidth]   = useLocalStorage('ide-ai-w',        DEFAULT_AI_PANEL_WIDTH);
  const [terminalHeight, setTerminalHeight] = useLocalStorage('ide-terminal-h',  DEFAULT_TERMINAL_HEIGHT);

  // Tabs
  const [activeActivityTab, setActiveActivityTab] = useState<ActivityBarTab>('files');
  const [activeEditorTab,   setActiveEditorTab]   = useState<EditorTab>('editor');

  // Open files
  const [openFiles,    setOpenFiles]    = useState<OpenFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  // Active project
  const [activeProject, setActiveProject] = useState<WorkspaceProject | null>(null);

  // ── Actions ─────────────────────────────────────────────────────────────────

  const toggleSidebar  = useCallback(() => setSidebarOpen(v => !v),  [setSidebarOpen]);
  const toggleAIPanel  = useCallback(() => setAIPanelOpen(v => !v),  [setAIPanelOpen]);
  const toggleTerminal = useCallback(() => setTerminalOpen(v => !v), [setTerminalOpen]);

  const openCommandPalette  = useCallback(() => setCommandPaletteOpen(true),  []);
  const closeCommandPalette = useCallback(() => setCommandPaletteOpen(false), []);

  const openFile = useCallback((file: FileEntry) => {
    if (file.type === 'folder') return;
    setOpenFiles(prev => {
      if (prev.find(f => f.id === file.id)) {
        setActiveFileId(file.id);
        return prev;
      }
      const lang = file.extension ? (getLanguage(file.name)) : 'plaintext';
      const next: OpenFile = {
        id: file.id,
        name: file.name,
        path: file.path,
        language: lang,
        isDirty: false,
      };
      setActiveFileId(file.id);
      return [...prev, next];
    });
    setActiveEditorTab('editor');
  }, []);

  const closeFile = useCallback((id: string) => {
    setOpenFiles(prev => {
      const idx = prev.findIndex(f => f.id === id);
      const next = prev.filter(f => f.id !== id);
      setActiveFileId(current => {
        if (current !== id) return current;
        if (next.length === 0) return null;
        const newIdx = Math.min(idx, next.length - 1);
        return next[newIdx]?.id ?? null;
      });
      return next;
    });
  }, []);

  const setActiveFile = useCallback((id: string) => {
    setActiveFileId(id);
  }, []);

  const updateFileContent = useCallback((id: string, content: string, isDirty = true) => {
    setOpenFiles(prev =>
      prev.map(f => f.id === id ? { ...f, content, isDirty } : f),
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
