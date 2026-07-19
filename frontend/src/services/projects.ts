import type { Project } from '@workspace/shared';
import { request } from './api.js';

// ─── Projects service ─────────────────────────────────────────────────────────

export async function fetchProjects(): Promise<Project[]> {
  const res = await request<Project[]>('/projects');
  if (!res.data) throw new Error('No projects returned');
  return res.data;
}

export async function fetchProject(id: string): Promise<Project> {
  const res = await request<Project>(`/projects/${id}`);
  if (!res.data) throw new Error('No project returned');
  return res.data;
}

export async function createProject(
  input: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Project> {
  const res = await request<Project>('/projects', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  if (!res.data) throw new Error('No project returned');
  return res.data;
}

export async function patchProject(
  id: string,
  updates: Partial<Omit<Project, 'id' | 'createdAt'>>,
): Promise<Project> {
  const res = await request<Project>(`/projects/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
  if (!res.data) throw new Error('No project returned');
  return res.data;
}

export async function removeProject(id: string): Promise<void> {
  await request(`/projects/${id}`, { method: 'DELETE' });
}
