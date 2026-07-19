import type { AppConfig } from '../types/index.js';

// ─── Application configuration ───────────────────────────────────────────────

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
    isDevelopment: nodeEnv === 'development',
    isProduction: nodeEnv === 'production',
  };
}

// Singleton — loaded once at startup
export const config = loadConfig();
