// ─── Database client re-export ────────────────────────────────────────────────
// Import the Prisma client from the shared database package so the rest of the
// backend can reach it via a single, stable import path.

export { prisma } from '@workspace/database';
export type { PrismaClient } from '@workspace/database';
