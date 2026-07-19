import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utilities/logger.js';

// ─── Application error class ─────────────────────────────────────────────────

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly isOperational = true,
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─── Global error-handling middleware ────────────────────────────────────────
// Must have 4 parameters for Express to treat it as an error handler.

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  if (err instanceof AppError && err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  // Unexpected / programming error — log it and return a generic message
  logger.error({ err }, 'Unhandled error');

  res.status(500).json({
    success: false,
    error: 'An unexpected error occurred',
  });
}

// ─── 404 handler ─────────────────────────────────────────────────────────────

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.path}`,
  });
}
