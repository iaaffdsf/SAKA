import type { Request } from 'express';

// ─── Augmented Express types ──────────────────────────────────────────────────

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

// ─── Application configuration ───────────────────────────────────────────────

export interface AppConfig {
  port: number;
  nodeEnv: string;
  sessionSecret: string;
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
} from '@workspace/shared';
