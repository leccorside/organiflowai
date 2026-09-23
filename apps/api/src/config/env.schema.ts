import { z } from 'zod';

const booleanString = z.enum(['true', 'false']).transform((value) => value === 'true');

const positiveInt = z.coerce.number().int().positive();

const commaSeparatedList = z.string().transform((value) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item !== ''),
);

/**
 * Variáveis de ambiente do backend (api, worker e scheduler).
 * Valores operacionais têm padrões seguros, mas nunca ficam fixos no código.
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),

  DATABASE_URL: z.string().min(1),
  DATABASE_CONNECTION_LIMIT: positiveInt.default(10),
  DATABASE_ALLOW_PUBLIC_KEY_RETRIEVAL: booleanString.default(false),

  REDIS_URL: z.string().min(1),

  CORS_ORIGINS: commaSeparatedList.default([]),
  TRUST_PROXY: booleanString.default(false),
  HTTP_REQUEST_TIMEOUT_MS: positiveInt.default(30_000),
  HTTP_BODY_LIMIT: z.string().default('1mb'),

  RATE_LIMIT_TTL_MS: positiveInt.default(60_000),
  RATE_LIMIT_MAX: positiveInt.default(120),

  QUEUE_DEFAULT_ATTEMPTS: positiveInt.default(3),
  QUEUE_BACKOFF_DELAY_MS: positiveInt.default(5_000),
  QUEUE_REMOVE_ON_COMPLETE: positiveInt.default(1_000),
  QUEUE_REMOVE_ON_FAIL: positiveInt.default(5_000),

  HEARTBEAT_INTERVAL_MS: positiveInt.default(10_000),
  HEARTBEAT_TTL_MS: positiveInt.default(30_000),

  HEALTH_CHECK_TIMEOUT_MS: positiveInt.default(2_000),
  FEATURE_FLAGS_CACHE_TTL_SECONDS: positiveInt.default(30),
});

export type Env = z.infer<typeof envSchema>;
