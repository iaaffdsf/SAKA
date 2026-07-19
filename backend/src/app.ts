import express from 'express';
import { corsMiddleware } from './middleware/cors.js';
import { requestLogger } from './middleware/request-logger.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import apiRouter from './routes/index.js';

// ─── Express application factory ──────────────────────────────────────────────

export function createApp(): express.Application {
  const app = express();

  // ── Core middleware ──────────────────────────────────────────────────────────
  app.use(corsMiddleware);
  app.use(requestLogger);
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // ── Routes ───────────────────────────────────────────────────────────────────
  app.use('/api', apiRouter);

  // ── Error handling ───────────────────────────────────────────────────────────
  // 404 must come after all routes; global error handler must be last
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
