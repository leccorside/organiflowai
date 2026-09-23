import { createRedisClient } from '@aom/database';
import { Inject, Injectable, type OnApplicationShutdown } from '@nestjs/common';
import type { Redis } from 'ioredis';
import { APP_CONFIG, type AppConfig } from '../config/app-config.js';

/**
 * Conexão Redis de uso geral (cache, locks, rate limit, heartbeats).
 * Fechada em `onApplicationShutdown` (última fase do shutdown), depois que os serviços
 * que a usam já fizeram sua limpeza em `onModuleDestroy`/`beforeApplicationShutdown`.
 */
@Injectable()
export class RedisService implements OnApplicationShutdown {
  readonly client: Redis;

  constructor(@Inject(APP_CONFIG) config: AppConfig) {
    this.client = createRedisClient(config.redis.url);
  }

  async onApplicationShutdown(): Promise<void> {
    await this.client.quit();
  }
}
