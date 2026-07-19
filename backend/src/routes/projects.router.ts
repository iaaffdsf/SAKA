import { Router } from 'express';
import type { Project } from '@workspace/shared';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from '../services/projects.service.js';

// ─── Projects routes ──────────────────────────────────────────────────────────

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const projects = await getProjects();
    res.json({ success: true, data: projects });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const project = await createProject(req.body as Omit<Project, 'id' | 'createdAt' | 'updatedAt'>);
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const project = await getProject(req.params.id!);
    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found' });
      return;
    }
    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const updated = await updateProject(req.params.id!, req.body as Partial<Project>);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Project not found' });
      return;
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await deleteProject(req.params.id!);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Project not found' });
      return;
    }
    res.json({ success: true, data: { deleted: true } });
  } catch (err) {
    next(err);
  }
});

export default router;
