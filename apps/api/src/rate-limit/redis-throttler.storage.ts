import { redisKey } from '@aom/database';
import type { ThrottlerStorage } from '@nestjs/throttler';
import type { Redis } from 'ioredis';

// KEYS[1] = contador da janela, KEYS[2] = marcador de bloqueio
// ARGV[1] = ttl (ms), ARGV[2] = limite, ARGV[3] = duração do bloqueio (ms)
// Retorna {hits, ttlMs, bloqueado (0/1), ttlBloqueioMs}.
const INCREMENT_SCRIPT = `
local blockTtl = redis.call('PTTL', KEYS[2])
if blockTtl > 0 then
  local hits = tonumber(redis.call('GET', KEYS[1]) or '0')
  return {hits, math.max(redis.call('PTTL', KEYS[1]), 0), 1, blockTtl}
end
local hits = redis.call('INCR', KEYS[1])
if hits == 1 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
end
local ttl = redis.call('PTTL', KEYS[1])
if hits > tonumber(ARGV[2]) then
  redis.call('SET', KEYS[2], '1', 'PX', ARGV[3])
  return {hits, ttl, 1, tonumber(ARGV[3])}
end
return {hits, ttl, 0, 0}`;

const toSeconds = (ms: number) => Math.max(0, Math.ceil(ms / 1000));

/**
 * Storage do @nestjs/throttler no Redis: o limite é compartilhado entre todas as instâncias
 * da API (o storage padrão é em memória, por processo). Operação atômica via Lua.
 * O throttler envia `ttl`/`blockDuration` em ms e espera os tempos de retorno em segundos.
 */
export class RedisThrottlerStorage implements ThrottlerStorage {
  constructor(private readonly redis: Redis) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<{
    totalHits: number;
    timeToExpire: number;
    isBlocked: boolean;
    timeToBlockExpire: number;
  }> {
    const [hits, ttlMs, blocked, blockTtlMs] = (await this.redis.eval(
      INCREMENT_SCRIPT,
      2,
      redisKey('throttle', throttlerName, key),
      redisKey('throttle-block', throttlerName, key),
      ttl,
      limit,
      blockDuration,
    )) as [number, number, number, number];

    return {
      totalHits: hits,
      timeToExpire: toSeconds(ttlMs),
      isBlocked: blocked === 1,
      timeToBlockExpire: toSeconds(blockTtlMs),
    };
  }
}
