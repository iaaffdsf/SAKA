import type { AppSettings } from '@workspace/shared';
import { readJson, writeJson } from './storage.service.js';

// ─── Settings service ─────────────────────────────────────────────────────────

const SETTINGS_FILE = 'settings.json';

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  fontSize: 14,
  tabSize: 2,
  wordWrap: true,
  minimap: false,
  lineNumbers: true,
  autoSave: true,
  aiProvider: '',
  aiModel: '',
};

export async function getSettings(): Promise<AppSettings> {
  return readJson<AppSettings>(SETTINGS_FILE, DEFAULT_SETTINGS);
}

export async function updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
  const current = await getSettings();
  const updated: AppSettings = { ...current, ...updates };
  await writeJson(SETTINGS_FILE, updated);
  return updated;
}
