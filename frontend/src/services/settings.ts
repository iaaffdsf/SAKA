import type { ApiResponse, AppSettings } from '@workspace/shared';
import { request } from './api.js';

// ─── Settings service ─────────────────────────────────────────────────────────

export async function fetchSettings(): Promise<AppSettings> {
  const res = await request<AppSettings>('/settings');
  if (!res.data) throw new Error('No settings returned');
  return res.data;
}

export async function saveSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
  const res = await request<AppSettings>('/settings', {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  if (!res.data) throw new Error('No settings returned');
  return res.data;
}
