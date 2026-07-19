import type { HealthCheckResponse } from '@workspace/shared';
import { checkStorage } from './storage.service.js';
import { logger } from '../utilities/logger.js';

// ─── Health service ───────────────────────────────────────────────────────────

const startTime = Date.now();

export async function getHealthStatus(): Promise<HealthCheckResponse> {
  let storageStatus: HealthCheckResponse['services']['storage'] = 'error';

  try {
    const ok = await checkStorage();
    storageStatus = ok ? 'ok' : 'error';
  } catch (err) {
    logger.warn({ err }, 'Storage health check failed');
  }

  return {
    status: storageStatus === 'ok' ? 'ok' : 'degraded',
    version: process.env.npm_package_version ?? '0.0.0',
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
    services: {
      storage: storageStatus,
      websocket: 'listening',
    },
  };
}
