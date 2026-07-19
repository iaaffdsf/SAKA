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
  /** Never send the raw key to the client — store only, display masked */
  apiKey?: string;
  enabled: boolean;
  createdAt: string;
}

// ─── Projects ─────────────────────────────────────────────────────────────────

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
