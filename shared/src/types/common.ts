// ─── Common types shared across frontend and backend ─────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export type Status = 'idle' | 'loading' | 'success' | 'error';

// ─── Application settings ─────────────────────────────────────────────────────

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  lineNumbers: boolean;
  autoSave: boolean;
  aiProvider: string;
  aiModel: string;
}

// ─── AI providers ─────────────────────────────────────────────────────────────

export type AiProviderType = 'openai' | 'anthropic' | 'ollama' | 'openrouter' | 'custom';

export interface AiProvider {
  id: string;
  name: string;
  type: AiProviderType;
  baseUrl?: string;
  apiKey?: string;
  enabled: boolean;
  createdAt: string;
}

// ─── Projects (AI context / memory) ──────────────────────────────────────────

export interface Project {
  id: string;
  name: string;
  description?: string;
  path: string;
  language?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── AI memory ────────────────────────────────────────────────────────────────

export type MemoryEntryKind = 'fact' | 'preference' | 'context' | 'instruction';

export interface MemoryEntry {
  id: string;
  kind: MemoryEntryKind;
  content: string;
  projectId?: string;
  tags: string[];
  createdAt: string;
}

// ─── Workspace (local folder management) ─────────────────────────────────────

export interface WorkspaceProject {
  id: string;
  name: string;
  path: string;
  description?: string;
  pinned: boolean;
  lastOpenedAt?: string;
  createdAt: string;
  color?: string;
}

// ─── File system ──────────────────────────────────────────────────────────────

export type GitStatus = 'modified' | 'added' | 'deleted' | 'untracked' | 'renamed' | 'clean';

export interface FileEntry {
  id: string;         // absolute path used as stable id
  name: string;
  path: string;       // absolute path
  relativePath: string;
  type: 'file' | 'folder';
  extension?: string;
  size?: number;
  gitStatus?: GitStatus;
  children?: FileEntry[];
}

export interface FileContent {
  path: string;
  content: string;
  size: number;
  language: string;
  encoding: 'utf8' | 'base64';
}

export interface SearchResult {
  name: string;
  path: string;
  relativePath: string;
  type: 'file' | 'folder';
}
