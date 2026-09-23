import { FEATURE_FLAGS } from '@aom/types';
import { verify } from '@node-rs/argon2';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { Prisma } from './generated/prisma/client';
import { DEMO_ORGANIZATION, seed } from './seed/seed';
import { createTestPrisma, resetDatabase } from './test/helpers';

const prisma = createTestPrisma();

const seedConfig = {
  superAdmin: { email: 'admin@example.com', name: 'Super Admin', password: 'senha-de-teste-forte' },
};

beforeEach(async () => {
  await resetDatabase(prisma);
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('conexão', () => {
  it('conecta ao MySQL 8 com servidor em UTC', async () => {
    const [row] = await prisma.$queryRaw<{ version: string; tz: string }[]>`
      SELECT VERSION() AS version, @@session.time_zone AS tz`;
    expect(row?.version).toMatch(/^8\./);
    expect(row?.tz).toMatch(/^(\+00:00|SYSTEM|UTC)$/);
  });
});

describe('seed', () => {
  it('cria Super Admin, Organização Demo, vínculo ADMIN e feature flags desabilitadas', async () => {
    const result = await seed(prisma, seedConfig);

    const user = await prisma.user.findUniqueOrThrow({ where: { id: result.superAdminId } });
    expect(user.isSuperAdmin).toBe(true);
    expect(user.emailVerifiedAt).toBeInstanceOf(Date);
    expect(user.passwordHash).toMatch(/^\$argon2id\$/);
    expect(await verify(user.passwordHash, seedConfig.superAdmin.password)).toBe(true);

    const organization = await prisma.organization.findUniqueOrThrow({
      where: { slug: DEMO_ORGANIZATION.slug },
      include: { members: true },
    });
    expect(organization.timezone).toBe('America/Sao_Paulo');
    expect(organization.members).toEqual([
      expect.objectContaining({ userId: user.id, role: 'ADMIN' }),
    ]);

    const flags = await prisma.featureFlag.findMany({ orderBy: { key: 'asc' } });
    expect(flags.map((flag) => flag.key)).toEqual(Object.values(FEATURE_FLAGS).sort());
    expect(flags.every((flag) => !flag.enabled)).toBe(true);
  });

  it('é idempotente e preserva senha e flags alteradas', async () => {
    const first = await seed(prisma, seedConfig);
    await prisma.featureFlag.update({
      where: { key: FEATURE_FLAGS.ENABLE_TRENDS },
      data: { enabled: true },
    });

    const second = await seed(prisma, {
      superAdmin: { ...seedConfig.superAdmin, password: 'outra-senha-diferente' },
    });

    expect(second).toEqual({ ...first, superAdminCreated: false });
    expect(await prisma.user.count()).toBe(1);
    expect(await prisma.organization.count()).toBe(1);
    expect(await prisma.organizationMember.count()).toBe(1);
    expect(await prisma.featureFlag.count()).toBe(Object.keys(FEATURE_FLAGS).length);

    const user = await prisma.user.findUniqueOrThrow({ where: { id: first.superAdminId } });
    expect(await verify(user.passwordHash, seedConfig.superAdmin.password)).toBe(true);
    const trends = await prisma.featureFlag.findUniqueOrThrow({
      where: { key: FEATURE_FLAGS.ENABLE_TRENDS },
    });
    expect(trends.enabled).toBe(true);
  });
});

describe('schema', () => {
  const newUser = (email: string) => ({ email, name: 'Teste', passwordHash: 'x' });

  it('gera UUID v7 e timestamps em UTC', async () => {
    const before = Date.now();
    const user = await prisma.user.create({ data: newUser('uuid@example.com') });
    expect(user.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
    expect(Math.abs(user.createdAt.getTime() - before)).toBeLessThan(60_000);
  });

  it('impede e-mail duplicado', async () => {
    await prisma.user.create({ data: newUser('dup@example.com') });
    await expect(prisma.user.create({ data: newUser('dup@example.com') })).rejects.toMatchObject({
      code: 'P2002',
    });
  });

  it('impede vínculo duplicado do mesmo usuário na mesma organização', async () => {
    const user = await prisma.user.create({ data: newUser('member@example.com') });
    const organization = await prisma.organization.create({ data: { name: 'Org', slug: 'org' } });
    const data = { organizationId: organization.id, userId: user.id };
    await prisma.organizationMember.create({ data });
    await expect(prisma.organizationMember.create({ data })).rejects.toBeInstanceOf(
      Prisma.PrismaClientKnownRequestError,
    );
  });

  it('aplica padrões de organização e papel', async () => {
    const user = await prisma.user.create({ data: newUser('defaults@example.com') });
    const organization = await prisma.organization.create({ data: { name: 'Org', slug: 'org2' } });
    const member = await prisma.organizationMember.create({
      data: { organizationId: organization.id, userId: user.id },
    });
    expect(organization).toMatchObject({ timezone: 'UTC', locale: 'pt-BR', deletedAt: null });
    expect(member.role).toBe('VIEWER');
  });

  it('mantém o log de auditoria quando o usuário é removido (SET NULL)', async () => {
    const user = await prisma.user.create({ data: newUser('audit@example.com') });
    const log = await prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        action: 'ai_provider.update',
        resource: 'ai_provider',
        resourceId: 'openai',
        before: { enabled: false },
        after: { enabled: true },
        ip: '127.0.0.1',
      },
    });

    await prisma.user.delete({ where: { id: user.id } });

    const kept = await prisma.auditLog.findUniqueOrThrow({ where: { id: log.id } });
    expect(kept.actorUserId).toBeNull();
    expect(kept.after).toEqual({ enabled: true });
  });

  it('armazena textos com acentuação e emoji (utf8mb4)', async () => {
    const organization = await prisma.organization.create({
      data: { name: 'Padaria São João 🥖', slug: 'padaria' },
    });
    const found = await prisma.organization.findUniqueOrThrow({ where: { id: organization.id } });
    expect(found.name).toBe('Padaria São João 🥖');
  });
});
