import { FEATURE_FLAGS, type FeatureFlagKey } from '@aom/types';
import { hash } from '@node-rs/argon2';
import type { PrismaClient } from '../generated/prisma/client';
import type { SeedConfig } from './config';

export const DEMO_ORGANIZATION = {
  slug: 'demo',
  name: 'Organização Demo',
  timezone: 'America/Sao_Paulo',
  locale: 'pt-BR',
} as const;

const FEATURE_FLAG_DESCRIPTIONS: Record<FeatureFlagKey, string> = {
  [FEATURE_FLAGS.ENABLE_AUTOPUBLISH]: 'Publicação automática sem aprovação manual',
  [FEATURE_FLAGS.ENABLE_AI_ROUTING]: 'Routing inteligente entre provedores de IA',
  [FEATURE_FLAGS.ENABLE_TRENDS]: 'Sugestões baseadas em fontes de tendências',
  [FEATURE_FLAGS.ENABLE_COMPETITOR_ANALYSIS]: 'Análise de concorrentes',
};

export interface SeedResult {
  superAdminId: string;
  superAdminCreated: boolean;
  organizationId: string;
}

/**
 * Seed idempotente de desenvolvimento: pode ser executado várias vezes sem duplicar dados.
 * - Super Admin: criado se não existir; a senha de um usuário existente NÃO é sobrescrita.
 * - Organização Demo com o Super Admin como ADMIN.
 * - Feature flags criadas desabilitadas (estado existente é preservado).
 *
 * Marca Demo (PASSO 8) e Campanha Demo (PASSO 21) entram quando as tabelas existirem.
 */
export async function seed(prisma: PrismaClient, config: SeedConfig): Promise<SeedResult> {
  const { superAdmin } = config;

  const existing = await prisma.user.findUnique({ where: { email: superAdmin.email } });
  const user =
    existing ??
    (await prisma.user.create({
      data: {
        email: superAdmin.email,
        name: superAdmin.name,
        passwordHash: await hash(superAdmin.password),
        isSuperAdmin: true,
        emailVerifiedAt: new Date(),
      },
    }));
  if (existing && !existing.isSuperAdmin) {
    await prisma.user.update({ where: { id: existing.id }, data: { isSuperAdmin: true } });
  }

  const organization = await prisma.organization.upsert({
    where: { slug: DEMO_ORGANIZATION.slug },
    update: {},
    create: DEMO_ORGANIZATION,
  });

  await prisma.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: organization.id, userId: user.id } },
    update: {},
    create: { organizationId: organization.id, userId: user.id, role: 'ADMIN' },
  });

  for (const [key, description] of Object.entries(FEATURE_FLAG_DESCRIPTIONS)) {
    await prisma.featureFlag.upsert({
      where: { key },
      update: { description },
      create: { key, description, enabled: false },
    });
  }

  return {
    superAdminId: user.id,
    superAdminCreated: existing === null,
    organizationId: organization.id,
  };
}
