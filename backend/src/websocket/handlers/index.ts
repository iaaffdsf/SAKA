import type { WebSocket } from 'ws';
import type { WsClient } from '../../types/index.js';
import { logger } from '../../utilities/logger.js';

// ─── WebSocket message handler ────────────────────────────────────────────────

export function handleMessage(
  ws: WebSocket,
  client: WsClient,
  raw: string,
): void {
  let message: { type?: unknown; payload?: unknown };

  try {
    message = JSON.parse(raw) as typeof message;
  } catch {
    ws.send(JSON.stringify({ type: 'error', payload: 'Invalid JSON' }));
    return;
  }

  logger.debug({ clientId: client.id, type: message.type }, 'WS message received');

  switch (message.type) {
    case 'ping':
      ws.send(JSON.stringify({ type: 'pong', payload: null, timestamp: new Date().toISOString() }));
      break;

    default:
      ws.send(
        JSON.stringify({
          type: 'error',
          payload: `Unknown message type: ${String(message.type)}`,
        }),
      );
  }
}
