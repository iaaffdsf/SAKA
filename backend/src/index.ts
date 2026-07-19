import http from 'http';
import { createApp } from './app.js';
import { createWsServer } from './websocket/ws-server.js';
import { config } from './utilities/config.js';
import { logger } from './utilities/logger.js';
import { prisma } from './database/client.js';

// ─── Bootstrap ────────────────────────────────────────────────────────────────

async function start(): Promise<void> {
  // Verify database connectivity before accepting traffic
  try {
    await prisma.$connect();
    logger.info('Database connected');
  } catch (err) {
    logger.error({ err }, 'Failed to connect to database');
    process.exit(1);
  }

  const app = createApp();
  const server = http.createServer(app);

  // Attach WebSocket server to the same HTTP server (no extra port needed)
  createWsServer(server);

  server.listen(config.port, '0.0.0.0', () => {
    logger.info(
      { port: config.port, env: config.nodeEnv },
      '🚀  Server listening',
    );
  });

  // ── Graceful shutdown ────────────────────────────────────────────────────────
  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, 'Shutdown signal received');

    server.close(async () => {
      await prisma.$disconnect();
      logger.info('Server closed, database disconnected');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

start().catch((err: unknown) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
