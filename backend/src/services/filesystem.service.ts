import fs from 'fs/promises';
import type { Dirent } from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import type { FileEntry, FileContent, SearchResult, GitStatus } from '@workspace/shared';

const execFileAsync = promisify(execFile);

// ─── Path safety ──────────────────────────────────────────────────────────────

export function validatePath(requestedPath: string, approvedPaths: string[]): string {
  const resolved = path.resolve(requestedPath);
  const allowed = approvedPaths.some((approved) => {
    const r = path.resolve(approved);
    return resolved === r || resolved.startsWith(r + path.sep);
  });
  if (!allowed) {
    throw new Error(`Access denied: "${resolved}" is not within any workspace folder`);
  }
  return resolved;
}

// ─── Language detection ───────────────────────────────────────────────────────

const EXT_LANG: Record<string, string> = {
  ts: 'typescript', tsx: 'tsx', mts: 'typescript',
  js: 'javascript', jsx: 'jsx', mjs: 'javascript', cjs: 'javascript',
  py: 'python', rs: 'rust', go: 'go',
  java: 'java', kt: 'kotlin', scala: 'scala',
  cpp: 'cpp', cc: 'cpp', cxx: 'cpp', c: 'c', h: 'c', hpp: 'cpp',
  cs: 'csharp', rb: 'ruby', php: 'php', swift: 'swift',
  css: 'css', scss: 'scss', sass: 'sass', less: 'less',
  html: 'html', htm: 'html', vue: 'vue', svelte: 'svelte',
  json: 'json', jsonc: 'json', json5: 'json',
  yaml: 'yaml', yml: 'yaml', toml: 'toml', xml: 'xml',
  md: 'markdown', mdx: 'mdx',
  sh: 'bash', bash: 'bash', zsh: 'bash', fish: 'fish', ps1: 'powershell',
  sql: 'sql', graphql: 'graphql', gql: 'graphql',
  env: 'dotenv', tf: 'terraform', tfvars: 'terraform',
  lock: 'plaintext', log: 'plaintext', txt: 'plaintext',
};

export function getLanguage(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower === 'dockerfile' || lower.startsWith('dockerfile.')) return 'dockerfile';
  if (lower === '.env' || lower.startsWith('.env.')) return 'dotenv';
  if (lower === 'makefile') return 'makefile';
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return EXT_LANG[ext] ?? 'plaintext';
}

// ─── Directories excluded from tree by default ────────────────────────────────

const DEFAULT_SKIP = new Set([
  '.git', 'node_modules', '.next', '.nuxt', 'dist', 'build', 'out',
  '__pycache__', '.cache', '.turbo', 'coverage', '.nyc_output',
  '.venv', 'venv', 'env', '.tox', 'target', '.gradle', '.idea',
]);

export interface TreeOptions {
  depth?: number;
  showHidden?: boolean;
  skipDirs?: Set<string>;
}

// ─── File tree ────────────────────────────────────────────────────────────────

export async function getTree(
  rootPath: string,
  relativeTo: string,
  opts: TreeOptions = {},
): Promise<FileEntry[]> {
  const { depth = 1, showHidden = false, skipDirs = DEFAULT_SKIP } = opts;

  let entries: Dirent[];
  try {
    entries = await fs.readdir(rootPath, { withFileTypes: true });
  } catch {
    return [];
  }

  const result: FileEntry[] = [];

  for (const entry of entries) {
    if (!showHidden && entry.name.startsWith('.')) continue;
    if (entry.isDirectory() && skipDirs.has(entry.name)) continue;

    const entryPath = path.join(rootPath, entry.name);
    const rel = path.relative(relativeTo, entryPath);

    if (entry.isDirectory()) {
      result.push({
        id: entryPath,
        name: entry.name,
        path: entryPath,
        relativePath: rel,
        type: 'folder',
        children: depth > 1
          ? await getTree(entryPath, relativeTo, { ...opts, depth: depth - 1 })
          : undefined,
      });
    } else if (entry.isFile() || entry.isSymbolicLink()) {
      const ext = entry.name.includes('.') ? entry.name.split('.').pop()?.toLowerCase() : undefined;
      let size: number | undefined;
      try { size = (await fs.stat(entryPath)).size; } catch { /* ignore */ }

      result.push({
        id: entryPath,
        name: entry.name,
        path: entryPath,
        relativePath: rel,
        type: 'file',
        extension: ext,
        size,
      });
    }
  }

  return result.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });
}

// ─── Read file ────────────────────────────────────────────────────────────────

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function readFile(filePath: string): Promise<FileContent> {
  const stat = await fs.stat(filePath);
  if (stat.size > MAX_FILE_SIZE) {
    throw new Error(`File too large (${Math.round(stat.size / 1024)} KB). Max: 5 MB`);
  }
  const content = await fs.readFile(filePath, 'utf-8');
  return {
    path: filePath,
    content,
    size: stat.size,
    language: getLanguage(path.basename(filePath)),
    encoding: 'utf8',
  };
}

// ─── Write file ───────────────────────────────────────────────────────────────

export async function writeFile(filePath: string, content: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, 'utf-8');
}

// ─── Create file or folder ────────────────────────────────────────────────────

export async function createEntry(
  parentPath: string,
  name: string,
  type: 'file' | 'folder',
  relativeTo: string,
): Promise<FileEntry> {
  const entryPath = path.join(parentPath, name);

  // Check existence
  try {
    await fs.access(entryPath);
    throw new Error(`"${name}" already exists`);
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
  }

  if (type === 'folder') {
    await fs.mkdir(entryPath, { recursive: true });
  } else {
    await fs.mkdir(path.dirname(entryPath), { recursive: true });
    await fs.writeFile(entryPath, '', 'utf-8');
  }

  const ext = type === 'file' && name.includes('.') ? name.split('.').pop()?.toLowerCase() : undefined;
  return {
    id: entryPath,
    name,
    path: entryPath,
    relativePath: path.relative(relativeTo, entryPath),
    type,
    extension: ext,
    size: 0,
  };
}

// ─── Delete entry ─────────────────────────────────────────────────────────────

export async function deleteEntry(entryPath: string): Promise<void> {
  await fs.rm(entryPath, { recursive: true, force: true });
}

// ─── Rename entry ─────────────────────────────────────────────────────────────

export async function renameEntry(
  entryPath: string,
  newName: string,
  relativeTo: string,
): Promise<FileEntry> {
  const parent = path.dirname(entryPath);
  const newPath = path.join(parent, newName);
  await fs.rename(entryPath, newPath);

  const stat = await fs.stat(newPath);
  const isDir = stat.isDirectory();
  const ext = !isDir && newName.includes('.') ? newName.split('.').pop()?.toLowerCase() : undefined;

  return {
    id: newPath,
    name: newName,
    path: newPath,
    relativePath: path.relative(relativeTo, newPath),
    type: isDir ? 'folder' : 'file',
    extension: ext,
    size: isDir ? undefined : stat.size,
  };
}

// ─── Copy entry ───────────────────────────────────────────────────────────────

export async function copyEntry(srcPath: string, destPath: string): Promise<void> {
  const stat = await fs.stat(srcPath);
  if (stat.isDirectory()) {
    await fs.cp(srcPath, destPath, { recursive: true });
  } else {
    await fs.copyFile(srcPath, destPath);
  }
}

// ─── Move entry ───────────────────────────────────────────────────────────────

export async function moveEntry(srcPath: string, destPath: string): Promise<void> {
  try {
    await fs.rename(srcPath, destPath);
  } catch {
    await copyEntry(srcPath, destPath);
    await deleteEntry(srcPath);
  }
}

// ─── Search files ─────────────────────────────────────────────────────────────

export async function searchFiles(
  rootPath: string,
  query: string,
  limit = 200,
): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  const lq = query.toLowerCase();

  async function walk(dir: string): Promise<void> {
    if (results.length >= limit) return;
    let entries: Dirent[];
    try { entries = await fs.readdir(dir, { withFileTypes: true }); }
    catch { return; }

    for (const e of entries) {
      if (results.length >= limit) return;
      if (e.name.startsWith('.')) continue;
      if (DEFAULT_SKIP.has(e.name)) continue;

      const ep = path.join(dir, e.name);
      const rel = path.relative(rootPath, ep);

      if (e.name.toLowerCase().includes(lq)) {
        results.push({ name: e.name, path: ep, relativePath: rel, type: e.isDirectory() ? 'folder' : 'file' });
      }

      if (e.isDirectory()) await walk(ep);
    }
  }

  await walk(rootPath);
  return results;
}

// ─── Git status ───────────────────────────────────────────────────────────────

export async function getGitStatus(rootPath: string): Promise<Record<string, GitStatus>> {
  try {
    const { stdout } = await execFileAsync(
      'git', ['-C', rootPath, 'status', '--porcelain', '-u'],
      { timeout: 5000, maxBuffer: 2 * 1024 * 1024 },
    );

    const status: Record<string, GitStatus> = {};
    for (const line of stdout.split('\n')) {
      if (!line.trim()) continue;
      const xy = line.substring(0, 2).trim();
      const filePart = line.substring(3).trim();
      // Handle renames: "old -> new"
      const filePath = filePart.includes(' -> ') ? filePart.split(' -> ')[1]! : filePart;
      const abs = path.join(rootPath, filePath.replace(/^"/, '').replace(/"$/, ''));

      let s: GitStatus = 'clean';
      if (xy === '??') s = 'untracked';
      else if (xy.includes('D')) s = 'deleted';
      else if (xy.includes('R')) s = 'renamed';
      else if (xy.includes('A')) s = 'added';
      else s = 'modified';

      status[abs] = s;
    }
    return status;
  } catch {
    return {};
  }
}
