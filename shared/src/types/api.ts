// ─── API contract types — aligned between frontend and backend ────────────────

export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'down';
  version: string;
  timestamp: string;
  uptime: number;
  services: {
    storage: 'ok' | 'error';
    websocket: 'listening' | 'stopped';
  };
}

export interface WebSocketMessage<T = unknown> {
  type: string;
  payload: T;
  timestamp: string;
}

export interface WebSocketEvent {
  type: 'connection' | 'disconnection' | 'message' | 'error' | 'ping' | 'pong';
  clientId: string;
  timestamp: string;
  payload?: unknown;
}

export type WebSocketMessageType =
  | 'ping'
  | 'pong'
  | 'subscribe'
  | 'unsubscribe'
  | 'error'
  | 'ack';
