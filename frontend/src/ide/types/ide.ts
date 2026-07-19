import type { FileEntry, GitStatus, WorkspaceProject } from '@workspace/shared';

// ─── IDE domain types ─────────────────────────────────────────────────────────

export type Theme = 'dark' | 'midnight' | 'light';

export type ActivityBarTab = 'files' | 'search' | 'git' | 'extensions';

export type EditorTab = 'editor' | 'preview';

// FileNode → FileEntry from shared (re-export for backward compat)
export type FileNode = FileEntry;

export interface OpenFile {
  id: string;
  name: string;
  path: string;
  language: string;
  isDirty: boolean;
  content?: string;
}

export interface Command {
  id: string;
  label: string;
  category: string;
  shortcut?: string;
  icon?: string;
  action: () => void;
}

export interface PanelSizes {
  sidebarWidth: number;
  aiPanelWidth: number;
  terminalHeight: number;
}

// FileEntry with UI-only state (not sent to backend)
export interface FileEntryUI extends FileEntry {
  expanded?: boolean;
  loading?: boolean;
  gitStatus?: GitStatus;
}

export type Clipboard = {
  action: 'copy' | 'cut';
  entry: FileEntryUI;
};

export interface IDEState {
  // Visibility
  sidebarOpen: boolean;
  aiPanelOpen: boolean;
  terminalOpen: boolean;
  commandPaletteOpen: boolean;

  // Sizes
  sidebarWidth: number;
  aiPanelWidth: number;
  terminalHeight: number;

  // Activity bar
  activeActivityTab: ActivityBarTab;

  // Editor tabs
  activeEditorTab: EditorTab;
  openFiles: OpenFile[];
  activeFileId: string | null;

  // Active workspace project
  activeProject: WorkspaceProject | null;

  // Actions
  toggleSidebar(): void;
  toggleAIPanel(): void;
  toggleTerminal(): void;
  openCommandPalette(): void;
  closeCommandPalette(): void;
  setSidebarWidth(w: number): void;
  setAIPanelWidth(w: number): void;
  setTerminalHeight(h: number): void;
  setActiveActivityTab(tab: ActivityBarTab): void;
  setActiveEditorTab(tab: EditorTab): void;
  setActiveProject(project: WorkspaceProject | null): void;
  openFile(file: FileEntry): void;
  closeFile(id: string): void;
  setActiveFile(id: string): void;
  updateFileContent(id: string, content: string, isDirty?: boolean): void;
}

// Re-export shared types used throughout the IDE
export type { FileEntry, GitStatus, WorkspaceProject };
