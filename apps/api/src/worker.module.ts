import { type DynamicModule, Module } from '@nestjs/common';
import type { AppConfig } from './config/app-config.js';
import { ConfigModule } from './config/config.module.js';
import { DatabaseModule } from './database/database.module.js';
import { HeartbeatModule } from './heartbeat/heartbeat.module.js';
import { LoggingModule } from './logging/logging.module.js';
import { FeatureFlagsModule } from './modules/feature-flags/feature-flags.module.js';
import { QueuesModule } from './queues/queues.module.js';

/**
 * Módulo raiz do processo `worker` (sem servidor HTTP): consome as filas BullMQ.
 * Os processadores de cada fila são registrados aqui nos passos de cada domínio.
 */
@Module({})
export class WorkerModule {
  static register(config: AppConfig): DynamicModule {
    return {
      module: WorkerModule,
      imports: [
        ConfigModule.forRoot(config),
        LoggingModule.forRoot('worker'),
        DatabaseModule,
        QueuesModule,
        FeatureFlagsModule,
        HeartbeatModule.forRoot('worker'),
      ],
    };
  }
}
