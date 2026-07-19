// ─── Application configuration ───────────────────────────────────────────────

export interface AppConfig {
  port: number;
  nodeEnv: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

// ─── WebSocket client tracking ────────────────────────────────────────────────

export interface WsClient {
  id: string;
  connectedAt: Date;
  isAlive: boolean;
}

// ─── Re-export shared types ───────────────────────────────────────────────────

export type {
  ApiResponse,
  HealthCheckResponse,
  WebSocketMessage,
  WebSocketEvent,
  AppSettings,
  AiProvider,
  Project,
  MemoryEntry,
} from '@workspace/shared';
