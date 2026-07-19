import type { FileEntry, FileContent, SearchResult } from '@workspace/shared';
import { request } from './api.js';

// ─── Filesystem service ───────────────────────────────────────────────────────

export async function fetchTree(
  dirPath: string,
  depth = 1,
  showHidden = false,
): Promise<FileEntry[]> {
  const params = new URLSearchParams({ path: dirPath, depth: String(depth), showHidden: String(showHidden) });
  const res = await request<FileEntry[]>(`/fs/tree?${params}`);
  return res.data ?? [];
}

export async function fetchFileContent(filePath: string): Promise<FileContent> {
  const params = new URLSearchParams({ path: filePath });
  const res = await request<FileContent>(`/fs/read?${params}`);
  if (!res.data) throw new Error(res.error ?? 'Failed to read file');
  return res.data;
}

export async function saveFileContent(filePath: string, content: string): Promise<void> {
  await request('/fs/write', {
    method: 'POST',
    body: JSON.stringify({ path: filePath, content }),
  });
}

export async function createFsEntry(
  parentPath: string,
  name: string,
  type: 'file' | 'folder',
  workspaceRoot: string,
): Promise<FileEntry> {
  const res = await request<FileEntry>('/fs/create', {
    method: 'POST',
    body: JSON.stringify({ parentPath, name, type, workspaceRoot }),
  });
  if (!res.data) throw new Error(res.error ?? 'Failed to create entry');
  return res.data;
}

export async function deleteFsEntry(entryPath: string): Promise<void> {
  await request('/fs/delete', {
    method: 'DELETE',
    body: JSON.stringify({ path: entryPath }),
  });
}

export async function renameFsEntry(
  entryPath: string,
  newName: string,
  workspaceRoot: string,
): Promise<FileEntry> {
  const res = await request<FileEntry>('/fs/rename', {
    method: 'PATCH',
    body: JSON.stringify({ path: entryPath, newName, workspaceRoot }),
  });
  if (!res.data) throw new Error(res.error ?? 'Failed to rename');
  return res.data;
}

export async function copyFsEntry(src: string, dest: string): Promise<void> {
  await request('/fs/copy', { method: 'POST', body: JSON.stringify({ src, dest }) });
}

export async function moveFsEntry(src: string, dest: string): Promise<void> {
  await request('/fs/move', { method: 'POST', body: JSON.stringify({ src, dest }) });
}

export async function searchFsFiles(root: string, q: string): Promise<SearchResult[]> {
  const params = new URLSearchParams({ root, q });
  const res = await request<SearchResult[]>(`/fs/search?${params}`);
  return res.data ?? [];
}

export async function fetchGitStatus(dirPath: string): Promise<Record<string, string>> {
  const params = new URLSearchParams({ path: dirPath });
  const res = await request<Record<string, string>>(`/fs/git-status?${params}`);
  return res.data ?? {};
}
