import { PrismaClient } from './generated/client/index.js';

// ─── Singleton pattern ────────────────────────────────────────────────────────
// In development, module hot-reloading can cause multiple PrismaClient
// instances. We store one on the global object to avoid connection pool
// exhaustion.

declare global {
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['warn', 'error'],
  });
}

export const prisma: PrismaClient =
  globalThis.__prismaClient ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prismaClient = prisma;
}

export type { PrismaClient };
export * from './generated/client/index.js';
