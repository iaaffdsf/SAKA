---
name: API empty-body resilience
description: api.ts request() must guard against empty/non-JSON responses before calling response.json().
---

## The problem

When the backend (Express on port 8080) is not yet ready, the Vite proxy returns a 502 Bad Gateway with an **empty body**. Calling `response.json()` on an empty body throws:

```
Failed to execute 'json' on 'Response': Unexpected end of JSON input
```

This propagates as an unhandled rejection that Vite's runtime error overlay shows as a crash.

## The fix

```ts
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
```

**Why:** `response.text()` never throws on empty bodies. Parse manually after the text check.

**How to apply:** Any time `request()` in `frontend/src/services/api.ts` is called. Applied once in the base function so all callers benefit.
