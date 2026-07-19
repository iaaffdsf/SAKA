import type { AppConfig } from '../types/index.js';

// ─── Application configuration ───────────────────────────────────────────────
// Reads and validates required environment variables at startup.
// Throws early if anything critical is missing.

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function parsePort(raw: string | undefined): number {
  const port = Number(raw ?? '8080');
  if (Number.isNaN(port) || port <= 0 || port > 65535) {
    throw new Error(`Invalid PORT value: "${raw}"`);
  }
  return port;
}

export function loadConfig(): AppConfig {
  const nodeEnv = process.env.NODE_ENV ?? 'development';

  return {
    port: parsePort(process.env.PORT),
    nodeEnv,
    sessionSecret: requireEnv('SESSION_SECRET'),
    isDevelopment: nodeEnv === 'development',
    isProduction: nodeEnv === 'production',
  };
}

// Singleton — loaded once at startup
export const config = loadConfig();
