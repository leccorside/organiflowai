/** Perfis de acesso iniciais (RBAC). Permissões granulares são definidas no PASSO 7. */
export const ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EDITOR', 'VIEWER'] as const;

export type Role = (typeof ROLES)[number];
