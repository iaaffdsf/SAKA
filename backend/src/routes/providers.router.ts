import { Router } from 'express';
import type { AiProvider } from '@workspace/shared';
import {
  getProviders,
  getProvider,
  addProvider,
  updateProvider,
  deleteProvider,
} from '../services/providers.service.js';

// ─── AI providers routes ──────────────────────────────────────────────────────

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const providers = await getProviders();
    res.json({ success: true, data: providers });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const provider = await addProvider(req.body as Omit<AiProvider, 'id' | 'createdAt'>);
    res.status(201).json({ success: true, data: provider });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const provider = await getProvider(req.params.id!);
    if (!provider) {
      res.status(404).json({ success: false, error: 'Provider not found' });
      return;
    }
    res.json({ success: true, data: provider });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const updated = await updateProvider(req.params.id!, req.body as Partial<AiProvider>);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Provider not found' });
      return;
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await deleteProvider(req.params.id!);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Provider not found' });
      return;
    }
    res.json({ success: true, data: { deleted: true } });
  } catch (err) {
    next(err);
  }
});

export default router;
