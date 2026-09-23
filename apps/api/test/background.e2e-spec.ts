import { hostname } from 'node:os';
import { QUEUE_NAMES } from '@aom/types';
import { getQueueToken } from '@nestjs/bullmq';
import type { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { Queue } from 'bullmq';
import type { Redis } from 'ioredis';
import { heartbeatKey } from '../src/heartbeat/heartbeat.js';
import { QUEUE_PREFIX } from '../src/queues/queues.module.js';
import { SchedulerModule } from '../src/scheduler.module.js';
import { WorkerModule } from '../src/worker.module.js';
import { testConfig, testRedis } from './utils.js';

const config = testConfig({ HEARTBEAT_INTERVAL_MS: '200', HEARTBEAT_TTL_MS: '1000' });

describe('processos de background (integração)', () => {
  let redis: Redis;

  beforeAll(() => {
    redis = testRedis();
  });

  beforeEach(async () => {
    await redis.flushdb();
  });

  afterAll(async () => {
    await redis.quit();
  });

  it.each([
    ['worker', WorkerModule],
    ['scheduler', SchedulerModule],
  ] as const)('%s publica heartbeat enquanto vivo e o remove no shutdown', async (role, module) => {
    const app: INestApplicationContext = await NestFactory.createApplicationContext(
      module.register(config),
      { logger: false },
    );
    await app.init();

    const key = heartbeatKey(role, hostname());
    const payload = JSON.parse((await redis.get(key)) ?? '{}') as { role?: string; pid?: number };
    expect(payload).toMatchObject({ role, pid: process.pid });
    const ttl = await redis.pttl(key);
    expect(ttl).toBeGreaterThan(0);
    expect(ttl).toBeLessThanOrEqual(1_000);

    await app.close();
    expect(await redis.exists(key)).toBe(0);
  });

  it('worker registra todas as filas com as opções padrão de retry/backoff', async () => {
    const app = await NestFactory.createApplicationContext(WorkerModule.register(config), {
      logger: false,
    });
    await app.init();

    for (const name of Object.values(QUEUE_NAMES)) {
      const queue = app.get<Queue>(getQueueToken(name));
      expect(queue.name).toBe(name);
      expect(queue.opts.prefix).toBe(QUEUE_PREFIX);
      expect(queue.defaultJobOptions).toMatchObject({
        attempts: config.queues.defaultAttempts,
        backoff: { type: 'exponential', delay: config.queues.backoffDelayMs },
      });
    }

    const queue = app.get<Queue>(getQueueToken(QUEUE_NAMES.NOTIFICATIONS));
    const job = await queue.add('probe', { ok: true });
    expect(await redis.exists(`${QUEUE_PREFIX}:${QUEUE_NAMES.NOTIFICATIONS}:${job.id}`)).toBe(1);

    await app.close();
  });
});
