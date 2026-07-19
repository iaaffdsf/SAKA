// ─── Frontend-specific type definitions ──────────────────────────────────────

export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
}

export interface FeatureCard {
  icon: string;
  title: string;
  description: string;
}

export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
}

// Re-export shared types for convenience
export type {
  ApiResponse,
  HealthCheckResponse,
  AppSettings,
  AiProvider,
  Project,
  MemoryEntry,
  Status,
} from '@workspace/shared';
