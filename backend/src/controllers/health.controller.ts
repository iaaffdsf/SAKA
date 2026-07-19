import type { Request, Response, NextFunction } from 'express';
import { getHealthStatus } from '../services/health.service.js';

// ─── Health controller ────────────────────────────────────────────────────────

export async function healthCheck(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const status = await getHealthStatus();
    const httpStatus = status.status === 'ok' ? 200 : 503;
    res.status(httpStatus).json({ success: true, data: status });
  } catch (err) {
    next(err);
  }
}
