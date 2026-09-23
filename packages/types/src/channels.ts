/**
 * Canais de distribuição suportados pela plataforma.
 * A existência de um canal não implica publicação automática: ela só é habilitada
 * onde a API oficial e os termos do serviço permitirem (demais canais usam fluxo assistido).
 */
export const CHANNEL_TYPES = [
  'INSTAGRAM',
  'FACEBOOK',
  'LINKEDIN',
  'X',
  'TIKTOK',
  'YOUTUBE',
  'BLOG',
  'GOOGLE_BUSINESS',
  'TELEGRAM',
] as const;

export type ChannelType = (typeof CHANNEL_TYPES)[number];
