import { Router } from 'express';
import healthRouter from './health.router.js';
import settingsRouter from './settings.router.js';
import providersRouter from './providers.router.js';
import projectsRouter from './projects.router.js';
import memoryRouter from './memory.router.js';

// ─── Root API router ──────────────────────────────────────────────────────────
// All routes are mounted under /api (set in app.ts).

const router = Router();

router.use('/healthz', healthRouter);
router.use('/settings', settingsRouter);
router.use('/providers', providersRouter);
router.use('/projects', projectsRouter);
router.use('/memory', memoryRouter);

export default router;
