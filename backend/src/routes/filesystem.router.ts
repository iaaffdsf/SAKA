import { Router } from 'express';
import {
  getTree,
  readFile,
  writeFile,
  createEntry,
  deleteEntry,
  renameEntry,
  copyEntry,
  moveEntry,
  searchFiles,
  getGitStatus,
  validatePath,
} from '../services/filesystem.service.js';
import { getApprovedPaths } from '../services/workspace.service.js';
import { AppError } from '../middleware/error-handler.js';

// ─── Filesystem routes ────────────────────────────────────────────────────────
// All operations are validated against registered workspace paths.

const router = Router();

/** Validate that the given path is within an approved workspace. */
async function guardPath(requestedPath: string): Promise<string> {
  const approved = await getApprovedPaths();
  try {
    return validatePath(requestedPath, approved);
  } catch {
    throw new AppError(403, `Access denied: path is outside any registered workspace`);
  }
}

// GET /api/fs/tree?path=<dir>&depth=1&showHidden=false
router.get('/tree', async (req, res, next) => {
  try {
    const { path: p, depth = '2', showHidden = 'false' } = req.query as Record<string, string>;
    if (!p) { res.status(400).json({ success: false, error: 'path is required' }); return; }
    const safe = await guardPath(p);
    const tree = await getTree(safe, safe, {
      depth: Math.min(Number(depth) || 2, 5),
      showHidden: showHidden === 'true',
    });
    res.json({ success: true, data: tree });
  } catch (err) { next(err); }
});

// GET /api/fs/read?path=<file>
router.get('/read', async (req, res, next) => {
  try {
    const { path: p } = req.query as { path?: string };
    if (!p) { res.status(400).json({ success: false, error: 'path is required' }); return; }
    const safe = await guardPath(p);
    const content = await readFile(safe);
    res.json({ success: true, data: content });
  } catch (err) { next(err); }
});

// POST /api/fs/write  { path, content }
router.post('/write', async (req, res, next) => {
  try {
    const { path: p, content } = req.body as { path: string; content: string };
    if (!p || content === undefined) { res.status(400).json({ success: false, error: 'path and content are required' }); return; }
    const safe = await guardPath(p);
    await writeFile(safe, content);
    res.json({ success: true, data: { written: true } });
  } catch (err) { next(err); }
});

// POST /api/fs/create  { parentPath, name, type, workspaceRoot }
router.post('/create', async (req, res, next) => {
  try {
    const { parentPath, name, type, workspaceRoot } = req.body as {
      parentPath: string; name: string; type: 'file' | 'folder'; workspaceRoot: string;
    };
    if (!parentPath || !name || !type) {
      res.status(400).json({ success: false, error: 'parentPath, name, type are required' }); return;
    }
    const safe = await guardPath(parentPath);
    const entry = await createEntry(safe, name, type, workspaceRoot ?? safe);
    res.status(201).json({ success: true, data: entry });
  } catch (err) { next(err); }
});

// DELETE /api/fs/delete  { path }
router.delete('/delete', async (req, res, next) => {
  try {
    const { path: p } = req.body as { path: string };
    if (!p) { res.status(400).json({ success: false, error: 'path is required' }); return; }
    const safe = await guardPath(p);
    await deleteEntry(safe);
    res.json({ success: true, data: { deleted: true } });
  } catch (err) { next(err); }
});

// PATCH /api/fs/rename  { path, newName, workspaceRoot }
router.patch('/rename', async (req, res, next) => {
  try {
    const { path: p, newName, workspaceRoot } = req.body as {
      path: string; newName: string; workspaceRoot: string;
    };
    if (!p || !newName) { res.status(400).json({ success: false, error: 'path and newName are required' }); return; }
    const safe = await guardPath(p);
    const entry = await renameEntry(safe, newName, workspaceRoot ?? safe);
    res.json({ success: true, data: entry });
  } catch (err) { next(err); }
});

// POST /api/fs/copy  { src, dest }
router.post('/copy', async (req, res, next) => {
  try {
    const { src, dest } = req.body as { src: string; dest: string };
    if (!src || !dest) { res.status(400).json({ success: false, error: 'src and dest are required' }); return; }
    await Promise.all([guardPath(src), guardPath(dest)]);
    await copyEntry(src, dest);
    res.json({ success: true, data: { copied: true } });
  } catch (err) { next(err); }
});

// POST /api/fs/move  { src, dest }
router.post('/move', async (req, res, next) => {
  try {
    const { src, dest } = req.body as { src: string; dest: string };
    if (!src || !dest) { res.status(400).json({ success: false, error: 'src and dest are required' }); return; }
    await Promise.all([guardPath(src), guardPath(dest)]);
    await moveEntry(src, dest);
    res.json({ success: true, data: { moved: true } });
  } catch (err) { next(err); }
});

// GET /api/fs/search?root=<dir>&q=<query>
router.get('/search', async (req, res, next) => {
  try {
    const { root, q } = req.query as { root?: string; q?: string };
    if (!root || !q) { res.status(400).json({ success: false, error: 'root and q are required' }); return; }
    const safe = await guardPath(root);
    const results = await searchFiles(safe, q);
    res.json({ success: true, data: results });
  } catch (err) { next(err); }
});

// GET /api/fs/git-status?path=<dir>
router.get('/git-status', async (req, res, next) => {
  try {
    const { path: p } = req.query as { path?: string };
    if (!p) { res.status(400).json({ success: false, error: 'path is required' }); return; }
    const safe = await guardPath(p);
    const status = await getGitStatus(safe);
    res.json({ success: true, data: status });
  } catch (err) { next(err); }
});

export default router;
