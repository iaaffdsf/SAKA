import type { MemoryEntry } from '@workspace/shared';
import { readJson, writeJson } from './storage.service.js';
import { generateId } from '@workspace/shared';

// ─── AI memory service ────────────────────────────────────────────────────────

const MEMORY_FILE = 'memory.json';

export async function getMemory(): Promise<MemoryEntry[]> {
  return readJson<MemoryEntry[]>(MEMORY_FILE, []);
}

export async function addMemoryEntry(
  input: Omit<MemoryEntry, 'id' | 'createdAt'>,
): Promise<MemoryEntry> {
  const memory = await getMemory();
  const entry: MemoryEntry = {
    ...input,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  await writeJson(MEMORY_FILE, [...memory, entry]);
  return entry;
}

export async function updateMemoryEntry(
  id: string,
  updates: Partial<Omit<MemoryEntry, 'id' | 'createdAt'>>,
): Promise<MemoryEntry | null> {
  const memory = await getMemory();
  const index = memory.findIndex((e) => e.id === id);
  if (index === -1) return null;
  const updated = { ...memory[index]!, ...updates };
  memory[index] = updated;
  await writeJson(MEMORY_FILE, memory);
  return updated;
}

export async function deleteMemoryEntry(id: string): Promise<boolean> {
  const memory = await getMemory();
  const filtered = memory.filter((e) => e.id !== id);
  if (filtered.length === memory.length) return false;
  await writeJson(MEMORY_FILE, filtered);
  return true;
}

export async function clearMemory(): Promise<void> {
  await writeJson(MEMORY_FILE, []);
}
