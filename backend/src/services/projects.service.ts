import type { Project } from '@workspace/shared';
import { readJson, writeJson } from './storage.service.js';
import { generateId } from '@workspace/shared';

// ─── Projects service ─────────────────────────────────────────────────────────

const PROJECTS_FILE = 'projects.json';

export async function getProjects(): Promise<Project[]> {
  return readJson<Project[]>(PROJECTS_FILE, []);
}

export async function getProject(id: string): Promise<Project | null> {
  const projects = await getProjects();
  return projects.find((p) => p.id === id) ?? null;
}

export async function createProject(
  input: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Project> {
  const projects = await getProjects();
  const now = new Date().toISOString();
  const project: Project = {
    ...input,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
  await writeJson(PROJECTS_FILE, [...projects, project]);
  return project;
}

export async function updateProject(
  id: string,
  updates: Partial<Omit<Project, 'id' | 'createdAt'>>,
): Promise<Project | null> {
  const projects = await getProjects();
  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) return null;
  const updated: Project = {
    ...projects[index]!,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  projects[index] = updated;
  await writeJson(PROJECTS_FILE, projects);
  return updated;
}

export async function deleteProject(id: string): Promise<boolean> {
  const projects = await getProjects();
  const filtered = projects.filter((p) => p.id !== id);
  if (filtered.length === projects.length) return false;
  await writeJson(PROJECTS_FILE, filtered);
  return true;
}
