import type { Redis } from 'ioredis';
import type { PrismaClient } from '../generated/prisma/client';
import { createPrismaClient } from '../prisma';
import { createRedisClient } from '../redis/connection';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} não definida`);
  }
  return value;
}

export function createTestPrisma(): PrismaClient {
  return createPrismaClient(requireEnv('TEST_DATABASE_URL'), {
    connectionLimit: 2,
    allowPublicKeyRetrieval: true,
  });
}

export function createTestRedis(): Redis {
  return createRedisClient(requireEnv('TEST_REDIS_URL'));
}

/** Remove todos os dados das tabelas (ordem respeita as foreign keys). */
export async function resetDatabase(prisma: PrismaClient): Promise<void> {
  await prisma.auditLog.deleteMany();
  await prisma.organizationMember.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();
  await prisma.featureFlag.deleteMany();
}
