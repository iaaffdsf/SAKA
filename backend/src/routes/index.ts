import { Router } from 'express';
import healthRouter from './health.router.js';

// ─── Root API router ──────────────────────────────────────────────────────────
// All routes are mounted under /api (set in app.ts).

const router = Router();

router.use('/healthz', healthRouter);

// Future routers go here, e.g.:
// router.use('/users',    usersRouter);
// router.use('/projects', projectsRouter);

export default router;
