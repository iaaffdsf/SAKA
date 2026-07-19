import pino from 'pino';

// ─── Logger ───────────────────────────────────────────────────────────────────
// Production:  structured JSON, ingested by log aggregators
// Development: human-readable output via pino-pretty

const isDev = process.env.NODE_ENV !== 'production';

export const logger = pino(
  isDev
    ? {
        level: 'debug',
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname',
          },
        },
      }
    : {
        level: 'info',
      },
);
