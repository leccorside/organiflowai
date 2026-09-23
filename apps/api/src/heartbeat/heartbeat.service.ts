import { hostname } from 'node:os';
import {
  Inject,
  Injectable,
  type OnApplicationBootstrap,
  type OnModuleDestroy,
} from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { APP_CONFIG, type AppConfig } from '../config/app-config.js';
import { RedisService } from '../database/redis.service.js';
import { type BackgroundRole, heartbeatKey, type HeartbeatPayload } from './heartbeat.js';

export const HEARTBEAT_ROLE = Symbol('HEARTBEAT_ROLE');

/**
 * Publica periodicamente no Redis que este processo (worker/scheduler) está vivo.
 * A chave expira sozinha (HEARTBEAT_TTL_MS) se o processo travar ou morrer.
 * Usado pelo healthcheck do container e pelo /health da API.
 */
@Injectable()
export class HeartbeatService implements OnApplicationBootstrap, OnModuleDestroy {
  private timer?: NodeJS.Timeout;
  private readonly instance = hostname();
  private readonly startedAt = new Date().toISOString();

  constructor(
    @Inject(HEARTBEAT_ROLE) private readonly role: BackgroundRole,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    private readonly redis: RedisService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(HeartbeatService.name);
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.beat();
    this.timer = setInterval(() => {
      this.beat().catch((err: unknown) =>
        this.logger.error({ err }, 'Falha ao publicar heartbeat'),
      );
    }, this.config.heartbeat.intervalMs);
    this.timer.unref();
    this.logger.info({ role: this.role, instance: this.instance }, 'Processo iniciado');
  }

  /** Remove o heartbeat antes de a conexão Redis ser fechada (onApplicationShutdown). */
  async onModuleDestroy(): Promise<void> {
    clearInterval(this.timer);
    await this.redis.client.del(heartbeatKey(this.role, this.instance)).catch(() => undefined);
  }

  private async beat(): Promise<void> {
    const payload: HeartbeatPayload = {
      role: this.role,
      instance: this.instance,
      pid: process.pid,
      startedAt: this.startedAt,
      at: new Date().toISOString(),
    };
    await this.redis.client.set(
      heartbeatKey(this.role, this.instance),
      JSON.stringify(payload),
      'PX',
      this.config.heartbeat.ttlMs,
    );
  }
}
