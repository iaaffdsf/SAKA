import {
  createContext, useContext, useCallback, useEffect, useState,
  useRef, type ReactNode,
} from 'react';
import type { WorkspaceProject, FileEntry, GitStatus, SearchResult, FileContent } from '@workspace/shared';
import type { FileEntryUI, Clipboard } from '@/ide/types/ide.js';
import {
  fetchWorkspace, addWorkspaceProject, removeWorkspaceProject,
  patchWorkspaceProject, markProjectOpened,
} from '@/services/workspace.js';
import {
  fetchTree, fetchFileContent, saveFileContent,
  createFsEntry, deleteFsEntry, renameFsEntry,
  copyFsEntry, moveFsEntry, searchFsFiles, fetchGitStatus,
} from '@/services/filesystem.js';

// ─── Context shape ────────────────────────────────────────────────────────────

export interface WorkspaceContextType {
  projects: WorkspaceProject[];
  isLoadingProjects: boolean;
  activeProject: WorkspaceProject | null;
  fileTree: FileEntryUI[];
  isLoadingTree: boolean;
  gitStatus: Record<string, GitStatus>;
  clipboard: Clipboard | null;
  expandedPaths: Set<string>;

  // Project ops
  refreshProjects(): Promise<void>;
  addProject(dirPath: string): Promise<WorkspaceProject>;
  removeProject(id: string): Promise<void>;
  pinProject(id: string, pinned: boolean): Promise<void>;
  renameProject(id: string, name: string): Promise<void>;
  openProject(project: WorkspaceProject): Promise<void>;
  closeProject(): void;

  // Tree ops
  expandFolder(folderPath: string): Promise<void>;
  collapseFolder(folderPath: string): void;
  refreshTree(): Promise<void>;

  // File ops
  createFile(parentPath: string, name: string): Promise<FileEntry>;
  createFolder(parentPath: string, name: string): Promise<FileEntry>;
  deleteEntry(entryPath: string): Promise<void>;
  renameEntry(entryPath: string, newName: string): Promise<FileEntry>;
  copyToClipboard(entry: FileEntryUI): void;
  cutToClipboard(entry: FileEntryUI): void;
  paste(destFolderPath: string): Promise<void>;
  clearClipboard(): void;

  // Search
  searchFiles(query: string): Promise<SearchResult[]>;

  // Content
  readFile(filePath: string): Promise<FileContent>;
  writeFile(filePath: string, content: string): Promise<void>;

  // Git
  refreshGitStatus(): Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Merge git status into a FileEntryUI tree (in-place clone). */
function applyGitStatus(tree: FileEntryUI[], status: Record<string, GitStatus>): FileEntryUI[] {
  return tree.map((entry) => ({
    ...entry,
    gitStatus: status[entry.path],
    children: entry.children ? applyGitStatus(entry.children as FileEntryUI[], status) : undefined,
  }));
}

/** Lazily inject children under a specific folder path in the tree. */
function injectChildren(
  tree: FileEntryUI[],
  folderPath: string,
  children: FileEntryUI[],
): FileEntryUI[] {
  return tree.map((entry) => {
    if (entry.path === folderPath) {
      return { ...entry, children, loading: false };
    }
    if (entry.children) {
      return { ...entry, children: injectChildren(entry.children as FileEntryUI[], folderPath, children) };
    }
    return entry;
  });
}

/** Set loading state on a folder in the tree. */
function setFolderLoading(tree: FileEntryUI[], folderPath: string, loading: boolean): FileEntryUI[] {
  return tree.map((entry) => {
    if (entry.path === folderPath) return { ...entry, loading };
    if (entry.children) {
      return { ...entry, children: setFolderLoading(entry.children as FileEntryUI[], folderPath, loading) };
    }
    return entry;
  });
}

/** Remove an entry at a given path from the tree. */
function removeFromTree(tree: FileEntryUI[], entryPath: string): FileEntryUI[] {
  return tree
    .filter((e) => e.path !== entryPath)
    .map((e) =>
      e.children ? { ...e, children: removeFromTree(e.children as FileEntryUI[], entryPath) } : e,
    );
}

/** Add an entry under the given parent in the tree. */
function addToTree(tree: FileEntryUI[], parentPath: string, entry: FileEntryUI): FileEntryUI[] {
  return tree.map((e) => {
    if (e.path === parentPath && e.type === 'folder') {
      const kids = e.children ? [...e.children as FileEntryUI[], entry] : [entry];
      kids.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
        return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      });
      return { ...e, children: kids };
    }
    if (e.children) return { ...e, children: addToTree(e.children as FileEntryUI[], parentPath, entry) };
    return e;
  });
}

/** Rename an entry in the tree. */
function renameInTree(tree: FileEntryUI[], oldPath: string, updated: FileEntryUI): FileEntryUI[] {
  return tree.map((e) => {
    if (e.path === oldPath) return updated;
    if (e.children) return { ...e, children: renameInTree(e.children as FileEntryUI[], oldPath, updated) };
    return e;
  });
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<WorkspaceProject[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [activeProject, setActiveProject] = useState<WorkspaceProject | null>(null);
  const [fileTree, setFileTree] = useState<FileEntryUI[]>([]);
  const [isLoadingTree, setIsLoadingTree] = useState(false);
  const [gitStatus, setGitStatus] = useState<Record<string, GitStatus>>({});
  const [clipboard, setClipboard] = useState<Clipboard | null>(null);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const gitInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Load projects on mount ─────────────────────────────────────────────────
  const refreshProjects = useCallback(async () => {
    try {
      const list = await fetchWorkspace();
      setProjects(list);
    } finally {
      setIsLoadingProjects(false);
    }
  }, []);

  useEffect(() => { void refreshProjects(); }, [refreshProjects]);

  // ── Git polling ────────────────────────────────────────────────────────────
  const refreshGitStatus = useCallback(async () => {
    if (!activeProject) return;
    try {
      const status = await fetchGitStatus(activeProject.path) as Record<string, GitStatus>;
      setGitStatus(status);
      setFileTree((prev) => applyGitStatus(prev, status));
    } catch { /* git not available */ }
  }, [activeProject]);

  useEffect(() => {
    if (!activeProject) {
      if (gitInterval.current) clearInterval(gitInterval.current);
      return;
    }
    void refreshGitStatus();
    gitInterval.current = setInterval(refreshGitStatus, 10_000);
    return () => {
      if (gitInterval.current) clearInterval(gitInterval.current);
    };
  }, [activeProject, refreshGitStatus]);

  // ── Project operations ─────────────────────────────────────────────────────

  const addProject = useCallback(async (dirPath: string) => {
    const project = await addWorkspaceProject(dirPath);
    await refreshProjects();
    return project;
  }, [refreshProjects]);

  const removeProject = useCallback(async (id: string) => {
    await removeWorkspaceProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (activeProject?.id === id) {
      setActiveProject(null);
      setFileTree([]);
    }
  }, [activeProject]);

  const pinProject = useCallback(async (id: string, pinned: boolean) => {
    const updated = await patchWorkspaceProject(id, { pinned });
    setProjects((prev) => prev.map((p) => p.id === id ? updated : p));
  }, []);

  const renameProject = useCallback(async (id: string, name: string) => {
    const updated = await patchWorkspaceProject(id, { name });
    setProjects((prev) => prev.map((p) => p.id === id ? updated : p));
    if (activeProject?.id === id) setActiveProject(updated);
  }, [activeProject]);

  const openProject = useCallback(async (project: WorkspaceProject) => {
    setIsLoadingTree(true);
    setFileTree([]);
    setExpandedPaths(new Set());
    setActiveProject(project);
    try {
      await markProjectOpened(project.id);
      const tree = await fetchTree(project.path, 2);
      setFileTree(tree as FileEntryUI[]);
      setExpandedPaths(new Set([project.path]));
    } finally {
      setIsLoadingTree(false);
    }
  }, []);

  const closeProject = useCallback(() => {
    setActiveProject(null);
    setFileTree([]);
    setExpandedPaths(new Set());
    setGitStatus({});
    if (gitInterval.current) clearInterval(gitInterval.current);
  }, []);

  // ── Tree operations ────────────────────────────────────────────────────────

  const expandFolder = useCallback(async (folderPath: string) => {
    setExpandedPaths((prev) => new Set([...prev, folderPath]));

    // Check if children are already loaded
    const findEntry = (tree: FileEntryUI[], p: string): FileEntryUI | undefined => {
      for (const e of tree) {
        if (e.path === p) return e;
        if (e.children) {
          const found = findEntry(e.children as FileEntryUI[], p);
          if (found) return found;
        }
      }
      return undefined;
    };
    const entry = findEntry(fileTree, folderPath);
    if (!entry || entry.children !== undefined) return; // already loaded

    setFileTree((prev) => setFolderLoading(prev, folderPath, true));
    try {
      const children = await fetchTree(folderPath, 1);
      const withStatus = applyGitStatus(children as FileEntryUI[], gitStatus);
      setFileTree((prev) => injectChildren(prev, folderPath, withStatus));
    } catch {
      setFileTree((prev) => setFolderLoading(prev, folderPath, false));
    }
  }, [fileTree, gitStatus]);

  const collapseFolder = useCallback((folderPath: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      next.delete(folderPath);
      return next;
    });
  }, []);

  const refreshTree = useCallback(async () => {
    if (!activeProject) return;
    setIsLoadingTree(true);
    try {
      const tree = await fetchTree(activeProject.path, 2);
      const withStatus = applyGitStatus(tree as FileEntryUI[], gitStatus);
      setFileTree(withStatus);
    } finally {
      setIsLoadingTree(false);
    }
  }, [activeProject, gitStatus]);

  // ── File operations ────────────────────────────────────────────────────────

  const createFile = useCallback(async (parentPath: string, name: string) => {
    const root = activeProject?.path ?? parentPath;
    const entry = await createFsEntry(parentPath, name, 'file', root);
    setFileTree((prev) => addToTree(prev, parentPath, entry as FileEntryUI));
    return entry;
  }, [activeProject]);

  const createFolder = useCallback(async (parentPath: string, name: string) => {
    const root = activeProject?.path ?? parentPath;
    const entry = await createFsEntry(parentPath, name, 'folder', root);
    setFileTree((prev) => addToTree(prev, parentPath, entry as FileEntryUI));
    return entry;
  }, [activeProject]);

  const deleteEntry = useCallback(async (entryPath: string) => {
    await deleteFsEntry(entryPath);
    setFileTree((prev) => removeFromTree(prev, entryPath));
  }, []);

  const renameEntry = useCallback(async (entryPath: string, newName: string) => {
    const root = activeProject?.path ?? '';
    const updated = await renameFsEntry(entryPath, newName, root);
    setFileTree((prev) => renameInTree(prev, entryPath, updated as FileEntryUI));
    return updated;
  }, [activeProject]);

  const copyToClipboard = useCallback((entry: FileEntryUI) => {
    setClipboard({ action: 'copy', entry });
  }, []);

  const cutToClipboard = useCallback((entry: FileEntryUI) => {
    setClipboard({ action: 'cut', entry });
  }, []);

  const clearClipboard = useCallback(() => setClipboard(null), []);

  const paste = useCallback(async (destFolderPath: string) => {
    if (!clipboard) return;
    const { action, entry } = clipboard;
    const dest = `${destFolderPath}/${entry.name}`;
    if (action === 'copy') {
      await copyFsEntry(entry.path, dest);
    } else {
      await moveFsEntry(entry.path, dest);
      setFileTree((prev) => removeFromTree(prev, entry.path));
    }
    // Reload the destination folder children
    const children = await fetchTree(destFolderPath, 1);
    setFileTree((prev) => injectChildren(prev, destFolderPath, children as FileEntryUI[]));
    if (action === 'cut') setClipboard(null);
  }, [clipboard]);

  // ── Search & read ──────────────────────────────────────────────────────────

  const searchFiles = useCallback(async (query: string): Promise<SearchResult[]> => {
    if (!activeProject) return [];
    return searchFsFiles(activeProject.path, query);
  }, [activeProject]);

  const readFile = useCallback((filePath: string) => fetchFileContent(filePath), []);
  const writeFile = useCallback((filePath: string, content: string) => saveFileContent(filePath, content), []);

  return (
    <WorkspaceContext.Provider
      value={{
        projects, isLoadingProjects, activeProject, fileTree,
        isLoadingTree, gitStatus, clipboard, expandedPaths,
        refreshProjects, addProject, removeProject, pinProject,
        renameProject, openProject, closeProject,
        expandFolder, collapseFolder, refreshTree,
        createFile, createFolder, deleteEntry, renameEntry,
        copyToClipboard, cutToClipboard, paste, clearClipboard,
        searchFiles, readFile, writeFile, refreshGitStatus,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used inside <WorkspaceProvider>');
  return ctx;
}
