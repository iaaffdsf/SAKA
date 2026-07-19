import { Router } from 'express';
import type { MemoryEntry } from '@workspace/shared';
import {
  getMemory,
  addMemoryEntry,
  updateMemoryEntry,
  deleteMemoryEntry,
  clearMemory,
} from '../services/memory.service.js';

// ─── AI memory routes ─────────────────────────────────────────────────────────

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const entries = await getMemory();
    res.json({ success: true, data: entries });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const entry = await addMemoryEntry(req.body as Omit<MemoryEntry, 'id' | 'createdAt'>);
    res.status(201).json({ success: true, data: entry });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const updated = await updateMemoryEntry(req.params.id!, req.body as Partial<MemoryEntry>);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Memory entry not found' });
      return;
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

router.delete('/clear', async (_req, res, next) => {
  try {
    await clearMemory();
    res.json({ success: true, data: { cleared: true } });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await deleteMemoryEntry(req.params.id!);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Memory entry not found' });
      return;
    }
    res.json({ success: true, data: { deleted: true } });
  } catch (err) {
    next(err);
  }
});

export default router;
