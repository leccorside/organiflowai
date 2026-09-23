import type { z } from 'zod';
import { envSchema } from './env.schema.js';

/** Token de injeção da configuração validada. */
export const APP_CONFIG = Symbol('APP_CONFIG');

export interface AppConfig {
  env: 'development' | 'test' | 'production';
  http: {
    port: number;
    corsOrigins: string[];
    trustProxy: boolean;
    requestTimeoutMs: number;
    bodyLimit: string;
  };
  log: { level: string };
  database: { url: string; connectionLimit: number; allowPublicKeyRetrieval: boolean };
  redis: { url: string };
  rateLimit: { ttlMs: number; max: number };
  queues: {
    defaultAttempts: number;
    backoffDelayMs: number;
    removeOnComplete: number;
    removeOnFail: number;
  };
  heartbeat: { intervalMs: number; ttlMs: number };
  health: { checkTimeoutMs: number };
  featureFlags: { cacheTtlSeconds: number };
}

export class InvalidConfigError extends Error {
  constructor(readonly issues: string[]) {
    super(`Configuração inválida:\n${issues.map((issue) => `  - ${issue}`).join('\n')}`);
    this.name = 'InvalidConfigError';
  }
}

/**
 * Valida o ambiente e monta a configuração tipada. Falha na inicialização (fail fast)
 * listando apenas nomes de variáveis e motivos — nunca os valores (podem ser secrets).
 */
export function loadConfig(env: Record<string, string | undefined> = process.env): AppConfig {
  // Variáveis vazias (ex.: `${VAR:-}` no docker compose) contam como ausentes → padrão aplicado.
  const defined = Object.fromEntries(Object.entries(env).filter(([, value]) => value !== ''));
  const parsed = envSchema.safeParse(defined);
  if (!parsed.success) {
    throw new InvalidConfigError(
      parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
    );
  }
  return toAppConfig(parsed.data);
}

function toAppConfig(env: z.infer<typeof envSchema>): AppConfig {
  return {
    env: env.NODE_ENV,
    http: {
      port: env.PORT,
      corsOrigins: env.CORS_ORIGINS,
      trustProxy: env.TRUST_PROXY,
      requestTimeoutMs: env.HTTP_REQUEST_TIMEOUT_MS,
      bodyLimit: env.HTTP_BODY_LIMIT,
    },
    log: { level: env.LOG_LEVEL },
    database: {
      url: env.DATABASE_URL,
      connectionLimit: env.DATABASE_CONNECTION_LIMIT,
      allowPublicKeyRetrieval: env.DATABASE_ALLOW_PUBLIC_KEY_RETRIEVAL,
    },
    redis: { url: env.REDIS_URL },
    rateLimit: { ttlMs: env.RATE_LIMIT_TTL_MS, max: env.RATE_LIMIT_MAX },
    queues: {
      defaultAttempts: env.QUEUE_DEFAULT_ATTEMPTS,
      backoffDelayMs: env.QUEUE_BACKOFF_DELAY_MS,
      removeOnComplete: env.QUEUE_REMOVE_ON_COMPLETE,
      removeOnFail: env.QUEUE_REMOVE_ON_FAIL,
    },
    heartbeat: { intervalMs: env.HEARTBEAT_INTERVAL_MS, ttlMs: env.HEARTBEAT_TTL_MS },
    health: { checkTimeoutMs: env.HEALTH_CHECK_TIMEOUT_MS },
    featureFlags: { cacheTtlSeconds: env.FEATURE_FLAGS_CACHE_TTL_SECONDS },
  };
}
