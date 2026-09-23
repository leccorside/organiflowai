import { Redis, type RedisOptions } from 'ioredis';

/**
 * Prefixo de todas as chaves criadas pela aplicação (exceto filas BullMQ, que usam o próprio).
 * Não usar a opção `keyPrefix` do ioredis: ela é incompatível com o BullMQ.
 */
export const REDIS_KEY_PREFIX = 'aom';

export function redisKey(...parts: string[]): string {
  return [REDIS_KEY_PREFIX, ...parts].join(':');
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
