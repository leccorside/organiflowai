import { createPrismaClient } from '../prisma';
import { readSeedConfig } from './config';
import { seed } from './seed';

// Executado por `prisma db seed` (ver prisma.config.ts) ou `pnpm db:seed`.
// Saída em JSON de uma linha (log estruturado), nunca com senhas.
const log = (level: 'info' | 'error', message: string, extra: Record<string, unknown> = {}) =>
  process[level === 'error' ? 'stderr' : 'stdout'].write(
    `${JSON.stringify({ level, service: 'database-seed', message, ...extra })}\n`,
  );

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  log('error', 'DATABASE_URL não definida');
  process.exit(1);
}

const prisma = createPrismaClient(databaseUrl, {
  connectionLimit: 2,
  allowPublicKeyRetrieval: process.env.DATABASE_ALLOW_PUBLIC_KEY_RETRIEVAL === 'true',
});

try {
  const result = await seed(prisma, readSeedConfig(process.env));
  log('info', 'Seed concluído', { ...result });
} catch (error) {
  log('error', 'Falha no seed', { error: error instanceof Error ? error.message : String(error) });
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
