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

  // Guard against empty or non-JSON responses (e.g. 502 from proxy when
  // backend is not yet ready) before attempting to parse.
  const text = await response.text();
  if (!text.trim()) {
    throw new Error(`HTTP ${response.status}: empty response from server`);
  }

  let data: ApiResponse<T>;
  try {
    data = JSON.parse(text) as ApiResponse<T>;
  } catch {
    throw new Error(`HTTP ${response.status}: invalid JSON — ${text.slice(0, 120)}`);
  }

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
