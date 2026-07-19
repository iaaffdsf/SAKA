import { WebSocketServer, WebSocket } from 'ws';
import type { IncomingMessage } from 'http';
import type { Server } from 'http';
import { generateId } from '@workspace/shared';
import type { WsClient } from '../types/index.js';
import { handleMessage } from './handlers/index.js';
import { logger } from '../utilities/logger.js';

// ─── WebSocket server ─────────────────────────────────────────────────────────

const clients = new Map<string, WsClient>();

export function createWsServer(httpServer: Server): WebSocketServer {
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    const clientId = generateId();
    const client: WsClient = { id: clientId, connectedAt: new Date(), isAlive: true };
    clients.set(clientId, client);

    logger.info({ clientId, ip: req.socket.remoteAddress }, 'WS client connected');

    ws.on('message', (data: Buffer | ArrayBuffer | Buffer[]) => {
      handleMessage(ws, client, data.toString());
    });

    ws.on('pong', () => {
      client.isAlive = true;
    });

    ws.on('close', () => {
      clients.delete(clientId);
      logger.info({ clientId }, 'WS client disconnected');
    });

    ws.on('error', (err: Error) => {
      logger.error({ clientId, err }, 'WS client error');
    });

    // Send a welcome message
    ws.send(
      JSON.stringify({
        type: 'ack',
        payload: { clientId, message: 'Connected to AI Dev Platform' },
        timestamp: new Date().toISOString(),
      }),
    );
  });

  // Heartbeat — terminate stale connections every 30 s
  const heartbeat = setInterval(() => {
    wss.clients.forEach((ws) => {
      const found = [...clients.values()].find((c) => {
        const wsAny = ws as WebSocket & { _socket?: unknown };
        return wsAny._socket !== undefined && c.isAlive !== undefined;
      });

      if (found && !found.isAlive) {
        logger.info({ clientId: found.id }, 'Terminating stale WS connection');
        ws.terminate();
        clients.delete(found.id);
        return;
      }

      if (found) found.isAlive = false;
      ws.ping();
    });
  }, 30_000);

  wss.on('close', () => clearInterval(heartbeat));

  logger.info('WebSocket server attached at /ws');
  return wss;
}

export function getConnectedClientCount(): number {
  return clients.size;
}
