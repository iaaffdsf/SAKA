import { Router } from 'express';
import type { WorkspaceProject } from '@workspace/shared';
import {
  getProjects,
  addProject,
  removeProject,
  updateProject,
  openProject,
} from '../services/workspace.service.js';

// ─── Workspace routes ─────────────────────────────────────────────────────────

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    res.json({ success: true, data: await getProjects() });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { path: dirPath, name } = req.body as { path: string; name?: string };
    if (!dirPath) {
      res.status(400).json({ success: false, error: 'path is required' });
      return;
    }
    const project = await addProject(dirPath, name);
    res.status(201).json({ success: true, data: project });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const ok = await removeProject(req.params.id!);
    if (!ok) { res.status(404).json({ success: false, error: 'Project not found' }); return; }
    res.json({ success: true, data: { deleted: true } });
  } catch (err) { next(err); }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const updated = await updateProject(
      req.params.id!,
      req.body as Partial<WorkspaceProject>,
    );
    if (!updated) { res.status(404).json({ success: false, error: 'Project not found' }); return; }
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
});

router.post('/:id/open', async (req, res, next) => {
  try {
    const project = await openProject(req.params.id!);
    if (!project) { res.status(404).json({ success: false, error: 'Project not found' }); return; }
    res.json({ success: true, data: project });
  } catch (err) { next(err); }
});

export default router;
