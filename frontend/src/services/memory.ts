import type { MemoryEntry } from '@workspace/shared';
import { request } from './api.js';

// ─── AI memory service ────────────────────────────────────────────────────────

export async function fetchMemory(): Promise<MemoryEntry[]> {
  const res = await request<MemoryEntry[]>('/memory');
  if (!res.data) throw new Error('No memory returned');
  return res.data;
}

export async function addMemory(
  input: Omit<MemoryEntry, 'id' | 'createdAt'>,
): Promise<MemoryEntry> {
  const res = await request<MemoryEntry>('/memory', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  if (!res.data) throw new Error('No memory entry returned');
  return res.data;
}

export async function removeMemory(id: string): Promise<void> {
  await request(`/memory/${id}`, { method: 'DELETE' });
}

export async function clearAllMemory(): Promise<void> {
  await request('/memory/clear', { method: 'DELETE' });
}
