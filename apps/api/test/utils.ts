import type { Redis } from 'ioredis';
import { createRedisClient } from '@aom/database';
import { type AppConfig, loadConfig } from '../src/config/app-config.js';

/** Configuração dos testes de integração: banco e Redis dedicados, logs silenciosos. */
export function testConfig(overrides: Record<string, string> = {}): AppConfig {
  const { TEST_DATABASE_URL, TEST_REDIS_URL } = process.env;
  if (!TEST_DATABASE_URL || !TEST_REDIS_URL) {
    throw new Error('TEST_DATABASE_URL e TEST_REDIS_URL são obrigatórias');
  }
  return loadConfig({
    NODE_ENV: 'test',
    LOG_LEVEL: 'silent',
    DATABASE_URL: TEST_DATABASE_URL,
    DATABASE_CONNECTION_LIMIT: '2',
    DATABASE_ALLOW_PUBLIC_KEY_RETRIEVAL: 'true',
    REDIS_URL: TEST_REDIS_URL,
    ...overrides,
  });
}

export function testRedis(): Redis {
  return createRedisClient(process.env.TEST_REDIS_URL ?? '');
}
