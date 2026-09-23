import type { Redis } from 'ioredis';
import { redisKey } from './connection';

// INCR + PEXPIRE atômicos: a janela começa na primeira requisição e expira sozinha.
const FIXED_WINDOW_SCRIPT = `
local current = redis.call('INCR', KEYS[1])
if current == 1 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
end
return {current, redis.call('PTTL', KEYS[1])}`;

export interface RateLimitResult {
  allowed: boolean;
  /** Requisições restantes na janela atual. */
  remaining: number;
  /** Milissegundos até a janela reiniciar. */
  resetInMs: number;
}

/**
 * Rate limit de janela fixa: consome 1 unidade de `key` e informa se está dentro de `limit`
 * na janela de `windowMs`. Usado para proteger recursos (ex.: tentativas de login, RPM de IA).
 */
export async function consumeRateLimit(
  redis: Redis,
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  if (!Number.isInteger(limit) || limit <= 0) {
    throw new RangeError('limit deve ser um inteiro positivo');
  }
  if (!Number.isInteger(windowMs) || windowMs <= 0) {
    throw new RangeError('windowMs deve ser um inteiro positivo');
  }

  const [count, ttl] = (await redis.eval(
    FIXED_WINDOW_SCRIPT,
    1,
    redisKey('ratelimit', key),
    windowMs,
  )) as [number, number];

  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    resetInMs: ttl > 0 ? ttl : windowMs,
  };
}
