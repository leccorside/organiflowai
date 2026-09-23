/** Ciclo de vida de um conteúdo no calendário editorial. */
export const CONTENT_STATUSES = [
  'IDEA',
  'DRAFT',
  'GENERATING',
  'REVIEW',
  'APPROVED',
  'SCHEDULED',
  'PUBLISHING',
  'PUBLISHED',
  'FAILED',
  'CANCELED',
] as const;

export type ContentStatus = (typeof CONTENT_STATUSES)[number];

/** Nível de autonomia da IA configurado pelo usuário. */
export const AUTONOMY_MODES = ['MANUAL', 'ASSISTED', 'AUTOMATIC'] as const;

export type AutonomyMode = (typeof AUTONOMY_MODES)[number];
