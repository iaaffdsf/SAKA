import http from 'http';
import { createApp } from './app.js';
import { createWsServer } from './websocket/ws-server.js';
import { config } from './utilities/config.js';
import { logger } from './utilities/logger.js';
import { checkStorage, CONFIG_DIR } from './services/storage.service.js';

// ─── Bootstrap ────────────────────────────────────────────────────────────────

async function start(): Promise<void> {
  // Verify local filesystem storage is accessible before accepting traffic
  const storageOk = await checkStorage();
  if (!storageOk) {
    logger.error('Local storage check failed — cannot write to config directory');
    process.exit(1);
  }
  logger.info({ configDir: CONFIG_DIR }, 'Local storage ready');

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
  const shutdown = (signal: string): void => {
    logger.info({ signal }, 'Shutdown signal received');
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((err: unknown) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
