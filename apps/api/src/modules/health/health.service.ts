import { readFileSync } from 'node:fs';
import { Inject, Injectable } from '@nestjs/common';
import { APP_CONFIG, type AppConfig } from '../../config/app-config.js';
import { PrismaService } from '../../database/prisma.service.js';
import { RedisService } from '../../database/redis.service.js';
import { HEARTBEAT_ROLES, heartbeatKey, type HeartbeatPayload } from '../../heartbeat/heartbeat.js';

export type DependencyStatus = 'up' | 'down';

export interface DependencyCheck {
  status: DependencyStatus;
  latencyMs: number;
  error?: string;
}

export interface ReadinessReport {
  status: 'ok' | 'error';
  checks: { database: DependencyCheck; redis: DependencyCheck };
}

export interface HealthReport extends ReadinessReport {
  version: string;
  uptimeSeconds: number;
  timestamp: string;
  background: Record<string, { instances: number }>;
}

// apps/api/package.json está no mesmo nível relativo a partir de src/ e de dist/.
const APP_VERSION = (
  JSON.parse(readFileSync(new URL('../../../package.json', import.meta.url), 'utf8')) as {
    version: string;
  }
).version;

class CheckTimeoutError extends Error {
  constructor(ms: number) {
    super(`timeout after ${ms}ms`);
  }
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new CheckTimeoutError(ms)), ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer);
  }
}

@Injectable()
export class HealthService {
  constructor(
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async readiness(): Promise<ReadinessReport> {
    const [database, redis] = await Promise.all([
      this.check(() => this.prisma.$queryRaw`SELECT 1`),
      this.check(() => this.redis.client.ping()),
    ]);
    const status = database.status === 'up' && redis.status === 'up' ? 'ok' : 'error';
    return { status, checks: { database, redis } };
  }

  async health(): Promise<HealthReport> {
    const readiness = await this.readiness();
    return {
      ...readiness,
      version: APP_VERSION,
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      background: readiness.checks.redis.status === 'up' ? await this.backgroundProcesses() : {},
    };
  }

  /** Instâncias de worker/scheduler com heartbeat válido (informativo; não afeta o status). */
  private async backgroundProcesses(): Promise<Record<string, { instances: number }>> {
    const result: Record<string, { instances: number }> = {};
    for (const role of HEARTBEAT_ROLES) {
      const keys = await this.scanKeys(heartbeatKey(role, '*'));
      const values = keys.length > 0 ? await this.redis.client.mget(...keys) : [];
      result[role] = {
        instances: values.filter((value) => {
          if (!value) return false;
          return (JSON.parse(value) as HeartbeatPayload).role === role;
        }).length,
      };
    }
    return result;
  }

  private async scanKeys(pattern: string): Promise<string[]> {
    const keys: string[] = [];
    let cursor = '0';
    do {
      const [next, batch] = await this.redis.client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = next;
      keys.push(...batch);
    } while (cursor !== '0');
    return keys;
  }

  private async check(probe: () => Promise<unknown>): Promise<DependencyCheck> {
    const started = performance.now();
    try {
      await withTimeout(probe(), this.config.health.checkTimeoutMs);
      return { status: 'up', latencyMs: Math.round(performance.now() - started) };
    } catch (error) {
      return {
        status: 'down',
        latencyMs: Math.round(performance.now() - started),
        // Mensagem genérica: detalhes de conexão (host, usuário) ficam só nos logs.
        error: error instanceof CheckTimeoutError ? error.message : 'unavailable',
      };
    }
  }
}
