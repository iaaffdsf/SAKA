import type { AiProvider } from '@workspace/shared';
import { request } from './api.js';

// ─── AI providers service ─────────────────────────────────────────────────────

export async function fetchProviders(): Promise<AiProvider[]> {
  const res = await request<AiProvider[]>('/providers');
  if (!res.data) throw new Error('No providers returned');
  return res.data;
}

export async function createProvider(
  input: Omit<AiProvider, 'id' | 'createdAt'>,
): Promise<AiProvider> {
  const res = await request<AiProvider>('/providers', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  if (!res.data) throw new Error('No provider returned');
  return res.data;
}

export async function patchProvider(
  id: string,
  updates: Partial<Omit<AiProvider, 'id' | 'createdAt'>>,
): Promise<AiProvider> {
  const res = await request<AiProvider>(`/providers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
  if (!res.data) throw new Error('No provider returned');
  return res.data;
}

export async function removeProvider(id: string): Promise<void> {
  await request(`/providers/${id}`, { method: 'DELETE' });
}
