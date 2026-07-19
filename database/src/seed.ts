import { prisma } from './client.js';

async function main(): Promise<void> {
  console.log('🌱  Seeding database…');

  // System user — used for internal operations
  await prisma.user.upsert({
    where: { email: 'system@platform.dev' },
    update: {},
    create: {
      email: 'system@platform.dev',
      name: 'System',
    },
  });

  console.log('✅  Database seeded successfully');
}

main()
  .catch((err: unknown) => {
    console.error('❌  Seeding failed:', err);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
