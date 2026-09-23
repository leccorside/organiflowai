import { type DynamicModule, Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { AllExceptionsFilter } from './common/errors/all-exceptions.filter.js';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor.js';
import { createValidationPipe } from './common/validation/validation.pipe.js';
import type { AppConfig } from './config/app-config.js';
import { ConfigModule } from './config/config.module.js';
import { DatabaseModule } from './database/database.module.js';
import { LoggingModule } from './logging/logging.module.js';
import { FeatureFlagsModule } from './modules/feature-flags/feature-flags.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { QueuesModule } from './queues/queues.module.js';
import { RateLimitModule } from './rate-limit/rate-limit.module.js';

/** Módulo raiz do processo HTTP (`backend`). */
@Module({})
export class AppModule {
  static register(config: AppConfig): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ConfigModule.forRoot(config),
        LoggingModule.forRoot('api'),
        DatabaseModule,
        RateLimitModule,
        QueuesModule,
        FeatureFlagsModule,
        HealthModule,
      ],
      providers: [
        { provide: APP_PIPE, useFactory: createValidationPipe },
        { provide: APP_FILTER, useClass: AllExceptionsFilter },
        { provide: APP_INTERCEPTOR, useClass: TimeoutInterceptor },
      ],
    };
  }
}
