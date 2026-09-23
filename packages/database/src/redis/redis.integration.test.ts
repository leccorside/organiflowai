import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createTestRedis } from '../test/helpers';
import { cacheDelete, cacheGet, cacheGetOrSet, cacheSet } from './cache';
import { redisKey } from './connection';
import { acquireLock, LockNotAcquiredError, withLock } from './lock';
import { consumeRateLimit } from './rate-limit';

const redis = createTestRedis();

beforeEach(async () => {
  // TEST_REDIS_URL aponta para um database dedicado (ex.: /15).
  await redis.flushdb();
});

afterAll(async () => {
  await redis.quit();
});

describe('lock distribuído', () => {
  it('concede o lock a um único dono por vez', async () => {
    const first = await acquireLock(redis, 'publication:123', 5_000);
    expect(first).not.toBeNull();
    expect(await acquireLock(redis, 'publication:123', 5_000)).toBeNull();

    expect(await first?.release()).toBe(true);
    expect(await acquireLock(redis, 'publication:123', 5_000)).not.toBeNull();
  });

  it('com disputa concorrente, apenas um processo adquire', async () => {
    const attempts = await Promise.all(
      Array.from({ length: 20 }, () => acquireLock(redis, 'publication:race', 5_000)),
    );
    expect(attempts.filter(Boolean)).toHaveLength(1);
  });

  it('não libera lock de outro dono após expiração', async () => {
    const stale = await acquireLock(redis, 'job:1', 50);
    await new Promise((resolve) => setTimeout(resolve, 120));
    const current = await acquireLock(redis, 'job:1', 5_000);

    expect(await stale?.release()).toBe(false);
    expect(await stale?.extend(5_000)).toBe(false);
    expect(await redis.get(redisKey('lock', 'job:1'))).toBe(current?.token);
  });

  it('renova o TTL do próprio lock', async () => {
    const lock = await acquireLock(redis, 'job:2', 1_000);
    expect(await lock?.extend(60_000)).toBe(true);
    expect(await redis.pttl(redisKey('lock', 'job:2'))).toBeGreaterThan(50_000);
  });

  it('withLock executa, libera ao final (inclusive em erro) e rejeita concorrente', async () => {
    await expect(withLock(redis, 'job:3', 5_000, () => Promise.resolve(42))).resolves.toBe(42);
    await expect(
      withLock(redis, 'job:3', 5_000, () => Promise.reject(new Error('falhou'))),
    ).rejects.toThrow('falhou');
    expect(await redis.exists(redisKey('lock', 'job:3'))).toBe(0);

    await withLock(redis, 'job:3', 5_000, async () => {
      await expect(withLock(redis, 'job:3', 5_000, () => Promise.resolve())).rejects.toBeInstanceOf(
        LockNotAcquiredError,
      );
    });
  });

  it('rejeita TTL inválido', async () => {
    await expect(acquireLock(redis, 'x', 0)).rejects.toThrow(RangeError);
  });
});

describe('cache', () => {
  it('armazena JSON com TTL e remove', async () => {
    await cacheSet(redis, 'brand:1', { name: 'Marca', tags: ['a'] }, 60);
    expect(await cacheGet(redis, 'brand:1')).toEqual({ name: 'Marca', tags: ['a'] });
    const ttl = await redis.ttl(redisKey('cache', 'brand:1'));
    expect(ttl).toBeGreaterThan(0);
    expect(ttl).toBeLessThanOrEqual(60);

    await cacheDelete(redis, 'brand:1');
    expect(await cacheGet(redis, 'brand:1')).toBeNull();
  });

  it('cacheGetOrSet chama o loader apenas no cache miss', async () => {
    let calls = 0;
    const loader = () => Promise.resolve({ value: ++calls });
    expect(await cacheGetOrSet(redis, 'k', 60, loader)).toEqual({ value: 1 });
    expect(await cacheGetOrSet(redis, 'k', 60, loader)).toEqual({ value: 1 });
    expect(calls).toBe(1);
  });
});

describe('rate limit (janela fixa)', () => {
  it('permite até o limite e bloqueia o excedente', async () => {
    const results = [];
    for (let i = 0; i < 4; i++) {
      results.push(await consumeRateLimit(redis, 'login:1.2.3.4', 3, 60_000));
    }
    expect(results.map((r) => r.allowed)).toEqual([true, true, true, false]);
    expect(results.map((r) => r.remaining)).toEqual([2, 1, 0, 0]);
    expect(results[3]?.resetInMs).toBeGreaterThan(0);
    expect(results[3]?.resetInMs).toBeLessThanOrEqual(60_000);
  });

  it('reinicia após a janela expirar', async () => {
    await consumeRateLimit(redis, 'ai:openai', 1, 100);
    expect((await consumeRateLimit(redis, 'ai:openai', 1, 100)).allowed).toBe(false);
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect((await consumeRateLimit(redis, 'ai:openai', 1, 100)).allowed).toBe(true);
  });
});
