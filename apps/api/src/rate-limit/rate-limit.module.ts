import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_CONFIG, type AppConfig } from '../config/app-config.js';
import { RedisService } from '../database/redis.service.js';
import { RedisThrottlerStorage } from './redis-throttler.storage.js';

/**
 * Rate limit global por IP (RATE_LIMIT_MAX requisições a cada RATE_LIMIT_TTL_MS).
 * Rotas podem ajustar com `@Throttle()` ou desligar com `@SkipThrottle()` (ex.: health checks).
 * Atrás de proxy/nginx, habilitar TRUST_PROXY para usar o IP real do cliente.
 */
@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      // APP_CONFIG e RedisService vêm de módulos globais.
      imports: [],
      inject: [APP_CONFIG, RedisService],
      useFactory: (config: AppConfig, redis: RedisService) => ({
        throttlers: [{ name: 'default', ttl: config.rateLimit.ttlMs, limit: config.rateLimit.max }],
        storage: new RedisThrottlerStorage(redis.client),
      }),
    }),
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class RateLimitModule {}
