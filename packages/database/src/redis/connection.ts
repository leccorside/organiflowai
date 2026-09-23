import { Redis, type RedisOptions } from 'ioredis';

/**
 * Prefixo de todas as chaves criadas pela aplicação (exceto filas BullMQ, que usam o próprio).
 * Não usar a opção `keyPrefix` do ioredis: ela é incompatível com o BullMQ.
 */
export const REDIS_KEY_PREFIX = 'aom';

export function redisKey(...parts: string[]): string {
  return [REDIS_KEY_PREFIX, ...parts].join(':');
}

/** Opções de conexão extraídas da URL (subconjunto compatível com ioredis e BullMQ). */
export interface RedisConnectionOptions {
  host: string;
  port: number;
  db: number;
  username?: string;
  password?: string;
  tls?: Record<string, never>;
}

/**
 * Converte `redis://[usuario:senha@]host[:porta][/db]` (ou `rediss://` com TLS) em opções
 * do ioredis. Usado quando a biblioteca precisa criar e gerenciar as próprias conexões
 * (ex.: BullMQ), em vez de receber uma instância compartilhada.
 */
export function toRedisOptions(redisUrl: string): RedisConnectionOptions {
  let url: URL;
  try {
    url = new URL(redisUrl);
  } catch {
    throw new Error('REDIS_URL inválida: esperado redis://host:porta/db');
  }
  if (url.protocol !== 'redis:' && url.protocol !== 'rediss:') {
    throw new Error(`REDIS_URL inválida: protocolo "${url.protocol}" não suportado`);
  }

  const dbPath = url.pathname.replace(/^\//, '');
  const db = dbPath === '' ? 0 : Number(dbPath);
  if (!Number.isInteger(db) || db < 0) {
    throw new Error('REDIS_URL inválida: database deve ser um inteiro não negativo');
  }

  return {
    host: url.hostname,
    port: url.port === '' ? 6379 : Number(url.port),
    db,
    ...(url.username ? { username: decodeURIComponent(url.username) } : {}),
    ...(url.password ? { password: decodeURIComponent(url.password) } : {}),
    ...(url.protocol === 'rediss:' ? { tls: {} } : {}),
  };
}

/**
 * Cria uma conexão Redis de uso geral (cache, locks, rate limit).
 * Conexões de workers BullMQ exigem `maxRetriesPerRequest: null` — passe via `options`.
 */
export function createRedisClient(redisUrl: string, options: RedisOptions = {}): Redis {
  return new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    ...options,
  });
}
