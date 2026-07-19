// ─── IDE domain types ─────────────────────────────────────────────────────────

export type Theme = 'dark' | 'midnight' | 'light';

export type ActivityBarTab = 'files' | 'search' | 'git' | 'extensions';

export type EditorTab = 'editor' | 'preview';

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  language?: string;
  children?: FileNode[];
  path: string;
}

export interface OpenFile {
  id: string;
  name: string;
  path: string;
  language: string;
  isDirty: boolean;
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
  openFile(file: FileNode): void;
  closeFile(id: string): void;
  setActiveFile(id: string): void;
}
