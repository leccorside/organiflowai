/** Perfis de acesso iniciais (RBAC). Permissões granulares são definidas no PASSO 7. */
export const ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EDITOR', 'VIEWER'] as const;

export type Role = (typeof ROLES)[number];

/**
 * Perfis atribuíveis dentro de uma organização. SUPER_ADMIN é um papel da plataforma
 * (flag do usuário), não de uma organização. Espelhado no enum `OrganizationRole` do Prisma.
 */
export const ORGANIZATION_ROLES = ['ADMIN', 'MANAGER', 'EDITOR', 'VIEWER'] as const;

export type OrganizationRole = (typeof ORGANIZATION_ROLES)[number];
