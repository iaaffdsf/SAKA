import { Router } from 'express';
import healthRouter from './health.router.js';
import settingsRouter from './settings.router.js';
import providersRouter from './providers.router.js';
import projectsRouter from './projects.router.js';
import memoryRouter from './memory.router.js';
import workspaceRouter from './workspace.router.js';
import filesystemRouter from './filesystem.router.js';

// ─── Root API router ──────────────────────────────────────────────────────────

const router = Router();

router.use('/healthz',    healthRouter);
router.use('/settings',   settingsRouter);
router.use('/providers',  providersRouter);
router.use('/projects',   projectsRouter);
router.use('/memory',     memoryRouter);
router.use('/workspace',  workspaceRouter);
router.use('/fs',         filesystemRouter);

export default router;
