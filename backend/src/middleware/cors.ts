import cors from 'cors';

// ─── CORS middleware ──────────────────────────────────────────────────────────
// In development we allow all origins so the Vite dev server can reach the API.
// In production this should be locked down to your actual domain(s).

const allowedOrigins =
  process.env.NODE_ENV === 'production'
    ? (process.env.ALLOWED_ORIGINS ?? '').split(',').filter(Boolean)
    : ['*'];

export const corsMiddleware = cors({
  origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
