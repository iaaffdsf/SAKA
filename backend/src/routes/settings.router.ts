import { Router } from 'express';
import { getSettings, updateSettings } from '../services/settings.service.js';

// ─── Settings routes ──────────────────────────────────────────────────────────

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const settings = await getSettings();
    res.json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
});

router.put('/', async (req, res, next) => {
  try {
    const updated = await updateSettings(req.body as Record<string, unknown>);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
