import type { ApiResponse, HealthCheckResponse } from '@workspace/shared';

// ─── API service ──────────────────────────────────────────────────────────────
// Thin wrapper around fetch that targets the backend API.
// Base URL is resolved from the current origin so it works in dev and prod.

const BASE_URL = '/api';

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<ApiResponse<T>> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });

  const data = (await response.json()) as ApiResponse<T>;

  if (!response.ok) {
    throw new Error(data.error ?? `HTTP ${response.status}`);
  }

  return data;
}

// ─── Health ───────────────────────────────────────────────────────────────────

export async function fetchHealth(): Promise<HealthCheckResponse> {
  const res = await request<HealthCheckResponse>('/healthz');
  if (!res.data) throw new Error('No health data returned');
  return res.data;
}

// Export the raw requester for use by feature services
export { request };
