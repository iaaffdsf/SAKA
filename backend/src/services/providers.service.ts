import type { AiProvider } from '@workspace/shared';
import { readJson, writeJson } from './storage.service.js';
import { generateId } from '@workspace/shared';

// ─── AI providers service ─────────────────────────────────────────────────────

const PROVIDERS_FILE = 'providers.json';

export async function getProviders(): Promise<AiProvider[]> {
  return readJson<AiProvider[]>(PROVIDERS_FILE, []);
}

export async function getProvider(id: string): Promise<AiProvider | null> {
  const providers = await getProviders();
  return providers.find((p) => p.id === id) ?? null;
}

export async function addProvider(
  input: Omit<AiProvider, 'id' | 'createdAt'>,
): Promise<AiProvider> {
  const providers = await getProviders();
  const provider: AiProvider = {
    ...input,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  await writeJson(PROVIDERS_FILE, [...providers, provider]);
  return provider;
}

export async function updateProvider(
  id: string,
  updates: Partial<Omit<AiProvider, 'id' | 'createdAt'>>,
): Promise<AiProvider | null> {
  const providers = await getProviders();
  const index = providers.findIndex((p) => p.id === id);
  if (index === -1) return null;
  const updated = { ...providers[index]!, ...updates };
  providers[index] = updated;
  await writeJson(PROVIDERS_FILE, providers);
  return updated;
}

export async function deleteProvider(id: string): Promise<boolean> {
  const providers = await getProviders();
  const filtered = providers.filter((p) => p.id !== id);
  if (filtered.length === providers.length) return false;
  await writeJson(PROVIDERS_FILE, filtered);
  return true;
}
