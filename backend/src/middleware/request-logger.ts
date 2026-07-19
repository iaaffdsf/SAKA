import pinoHttp from 'pino-http';
import { logger } from '../utilities/logger.js';

// ─── HTTP request logger middleware ──────────────────────────────────────────

export const requestLogger = pinoHttp({
  logger,
  // Don't log health-check requests to keep noise down
  autoLogging: {
    ignore: (req) => req.url === '/api/healthz',
  },
  customLogLevel: (_req, res, err) => {
    if (err !== undefined || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
});
