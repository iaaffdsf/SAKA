import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utilities/logger.js';

// ─── Config directory ─────────────────────────────────────────────────────────
// Stored at <workspace-root>/.ai-ide/ — the personal workspace config folder.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// backend/src/services/ → backend/ → workspace root
const WORKSPACE_ROOT = path.resolve(__dirname, '..', '..', '..');
export const CONFIG_DIR = path.join(WORKSPACE_ROOT, '.ai-ide');

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

// ─── Core read / write helpers ────────────────────────────────────────────────

export async function readJson<T>(filename: string, defaultValue: T): Promise<T> {
  const filepath = path.join(CONFIG_DIR, filename);
  try {
    const content = await fs.readFile(filepath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return defaultValue;
    }
    logger.warn({ err, filepath }, 'Failed to read config file, using default');
    return defaultValue;
  }
}

export async function writeJson<T>(filename: string, data: T): Promise<void> {
  const filepath = path.join(CONFIG_DIR, filename);
  await ensureDir(path.dirname(filepath));
  await fs.writeFile(filepath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

export async function deleteJson(filename: string): Promise<boolean> {
  const filepath = path.join(CONFIG_DIR, filename);
  try {
    await fs.unlink(filepath);
    return true;
  } catch {
    return false;
  }
}

// ─── Storage health check ─────────────────────────────────────────────────────

export async function checkStorage(): Promise<boolean> {
  try {
    await ensureDir(CONFIG_DIR);
    const testFile = path.join(CONFIG_DIR, '.health-check');
    await fs.writeFile(testFile, 'ok', 'utf-8');
    await fs.unlink(testFile);
    return true;
  } catch (err) {
    logger.error({ err }, 'Storage health check failed');
    return false;
  }
}
