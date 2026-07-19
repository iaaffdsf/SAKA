import type { HealthCheckResponse } from '@workspace/shared';
import { prisma } from '../database/client.js';
import { logger } from '../utilities/logger.js';

const startTime = Date.now();

// ─── Health service ───────────────────────────────────────────────────────────

export async function getHealthStatus(): Promise<HealthCheckResponse> {
  let dbStatus: HealthCheckResponse['services']['database'] = 'disconnected';

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (err) {
    logger.warn({ err }, 'Database health check failed');
  }

  return {
    status: dbStatus === 'connected' ? 'ok' : 'degraded',
    version: process.env.npm_package_version ?? '0.0.0',
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
    services: {
      database: dbStatus,
      // WebSocket status is injected by the WS server at runtime
      websocket: 'listening',
    },
  };
}
