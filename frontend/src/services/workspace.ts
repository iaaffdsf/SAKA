import type { WorkspaceProject } from '@workspace/shared';
import { request } from './api.js';

// ─── Workspace service ────────────────────────────────────────────────────────

export async function fetchWorkspace(): Promise<WorkspaceProject[]> {
  const res = await request<WorkspaceProject[]>('/workspace');
  return res.data ?? [];
}

export async function addWorkspaceProject(
  dirPath: string,
  name?: string,
): Promise<WorkspaceProject> {
  const res = await request<WorkspaceProject>('/workspace', {
    method: 'POST',
    body: JSON.stringify({ path: dirPath, name }),
  });
  if (!res.data) throw new Error(res.error ?? 'Failed to add project');
  return res.data;
}

export async function removeWorkspaceProject(id: string): Promise<void> {
  await request(`/workspace/${id}`, { method: 'DELETE' });
}

export async function patchWorkspaceProject(
  id: string,
  updates: Partial<WorkspaceProject>,
): Promise<WorkspaceProject> {
  const res = await request<WorkspaceProject>(`/workspace/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
  if (!res.data) throw new Error(res.error ?? 'Failed to update project');
  return res.data;
}

export async function markProjectOpened(id: string): Promise<WorkspaceProject> {
  const res = await request<WorkspaceProject>(`/workspace/${id}/open`, { method: 'POST' });
  if (!res.data) throw new Error(res.error ?? 'Failed to open project');
  return res.data;
}
