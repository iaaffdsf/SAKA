import fs from 'fs/promises';
import path from 'path';
import type { WorkspaceProject } from '@workspace/shared';
import { readJson, writeJson } from './storage.service.js';
import { generateId } from '@workspace/shared';

// ─── Workspace service ────────────────────────────────────────────────────────
// Manages the list of local project folders the user has added.

const WORKSPACE_FILE = 'workspace.json';

export async function getProjects(): Promise<WorkspaceProject[]> {
  const projects = await readJson<WorkspaceProject[]>(WORKSPACE_FILE, []);
  return projects.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    const aTime = a.lastOpenedAt ?? a.createdAt;
    const bTime = b.lastOpenedAt ?? b.createdAt;
    return bTime.localeCompare(aTime);
  });
}

export async function addProject(
  projectPath: string,
  name?: string,
): Promise<WorkspaceProject> {
  const resolved = path.resolve(projectPath);

  const stat = await fs.stat(resolved);
  if (!stat.isDirectory()) {
    throw new Error('Path must be a directory');
  }

  const projects = await readJson<WorkspaceProject[]>(WORKSPACE_FILE, []);

  const existing = projects.find((p) => path.resolve(p.path) === resolved);
  if (existing) throw new Error('Project already in workspace');

  const project: WorkspaceProject = {
    id: generateId(),
    name: name ?? path.basename(resolved),
    path: resolved,
    pinned: false,
    createdAt: new Date().toISOString(),
  };

  await writeJson(WORKSPACE_FILE, [...projects, project]);
  return project;
}

export async function removeProject(id: string): Promise<boolean> {
  const projects = await readJson<WorkspaceProject[]>(WORKSPACE_FILE, []);
  const filtered = projects.filter((p) => p.id !== id);
  if (filtered.length === projects.length) return false;
  await writeJson(WORKSPACE_FILE, filtered);
  return true;
}

export async function updateProject(
  id: string,
  updates: Partial<Pick<WorkspaceProject, 'name' | 'pinned' | 'description' | 'color' | 'lastOpenedAt'>>,
): Promise<WorkspaceProject | null> {
  const projects = await readJson<WorkspaceProject[]>(WORKSPACE_FILE, []);
  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) return null;
  const updated: WorkspaceProject = { ...projects[index]!, ...updates };
  projects[index] = updated;
  await writeJson(WORKSPACE_FILE, projects);
  return updated;
}

export async function openProject(id: string): Promise<WorkspaceProject | null> {
  return updateProject(id, { lastOpenedAt: new Date().toISOString() });
}

/** Returns the absolute paths of all registered workspace folders. */
export async function getApprovedPaths(): Promise<string[]> {
  const projects = await readJson<WorkspaceProject[]>(WORKSPACE_FILE, []);
  return projects.map((p) => path.resolve(p.path));
}
