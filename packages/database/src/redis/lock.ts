import { randomUUID } from 'node:crypto';
import type { Redis } from 'ioredis';
import { redisKey } from './connection';

// Só remove/renova a chave se ela ainda pertencer ao dono do lock (token),
// evitando liberar um lock que expirou e foi adquirido por outro processo.
const RELEASE_SCRIPT = `
if redis.call('GET', KEYS[1]) == ARGV[1] then
  return redis.call('DEL', KEYS[1])
end
return 0`;

const EXTEND_SCRIPT = `
if redis.call('GET', KEYS[1]) == ARGV[1] then
  return redis.call('PEXPIRE', KEYS[1], ARGV[2])
end
return 0`;

export class LockNotAcquiredError extends Error {
  constructor(readonly resource: string) {
    super(`Lock não adquirido: ${resource}`);
    this.name = 'LockNotAcquiredError';
  }
}

export interface LockHandle {
  readonly resource: string;
  readonly token: string;
  /** Libera o lock; retorna false se ele já tinha expirado ou pertencia a outro dono. */
  release(): Promise<boolean>;
  /** Renova o TTL; retorna false se o lock já não pertence mais a este dono. */
  extend(ttlMs: number): Promise<boolean>;
}

/**
 * Lock distribuído em uma instância Redis (SET NX PX + liberação atômica por token).
 * Retorna `null` se o recurso já estiver bloqueado.
 */
export async function acquireLock(
  redis: Redis,
  resource: string,
  ttlMs: number,
): Promise<LockHandle | null> {
  if (!Number.isInteger(ttlMs) || ttlMs <= 0) {
    throw new RangeError('ttlMs deve ser um inteiro positivo');
  }

  const key = redisKey('lock', resource);
  const token = randomUUID();
  const result = await redis.set(key, token, 'PX', ttlMs, 'NX');
  if (result !== 'OK') {
    return null;
  }

  return {
    resource,
    token,
    release: async () => (await redis.eval(RELEASE_SCRIPT, 1, key, token)) === 1,
    extend: async (newTtlMs: number) =>
      (await redis.eval(EXTEND_SCRIPT, 1, key, token, newTtlMs)) === 1,
  };
}

/**
 * Executa `fn` com o recurso bloqueado e sempre libera o lock ao final.
 * Lança `LockNotAcquiredError` se outro processo já detiver o lock.
 */
export async function withLock<T>(
  redis: Redis,
  resource: string,
  ttlMs: number,
  fn: (lock: LockHandle) => Promise<T>,
): Promise<T> {
  const lock = await acquireLock(redis, resource, ttlMs);
  if (!lock) {
    throw new LockNotAcquiredError(resource);
  }
  try {
    return await fn(lock);
  } finally {
    await lock.release();
  }
}
