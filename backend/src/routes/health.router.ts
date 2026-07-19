import { Router } from 'express';
import { healthCheck } from '../controllers/health.controller.js';

// ─── Health router ────────────────────────────────────────────────────────────

const router = Router();

// GET /api/healthz
router.get('/', healthCheck);

export default router;
