import type { Redis } from 'ioredis';
import { redisKey } from './connection';

/** Lê um valor JSON do cache. Retorna `null` se a chave não existir. */
export async function cacheGet<T>(redis: Redis, key: string): Promise<T | null> {
  const raw = await redis.get(redisKey('cache', key));
  return raw === null ? null : (JSON.parse(raw) as T);
}

export async function cacheSet(
  redis: Redis,
  key: string,
  value: unknown,
  ttlSeconds: number,
): Promise<void> {
  if (!Number.isInteger(ttlSeconds) || ttlSeconds <= 0) {
    throw new RangeError('ttlSeconds deve ser um inteiro positivo');
  }
  await redis.set(redisKey('cache', key), JSON.stringify(value), 'EX', ttlSeconds);
}

export async function cacheDelete(redis: Redis, key: string): Promise<void> {
  await redis.del(redisKey('cache', key));
}

/**
 * Retorna o valor em cache ou executa `loader`, armazena e retorna o resultado.
 * `undefined` não é armazenado (não representável em JSON).
 */
export async function cacheGetOrSet<T>(
  redis: Redis,
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>,
): Promise<T> {
  const cached = await cacheGet<T>(redis, key);
  if (cached !== null) {
    return cached;
  }
  const value = await loader();
  if (value !== undefined) {
    await cacheSet(redis, key, value, ttlSeconds);
  }
  return value;
}
