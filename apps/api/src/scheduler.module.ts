import { type DynamicModule, Module } from '@nestjs/common';
import type { AppConfig } from './config/app-config.js';
import { ConfigModule } from './config/config.module.js';
import { DatabaseModule } from './database/database.module.js';
import { HeartbeatModule } from './heartbeat/heartbeat.module.js';
import { LoggingModule } from './logging/logging.module.js';
import { QueuesModule } from './queues/queues.module.js';

/**
 * Módulo raiz do processo `scheduler` (sem servidor HTTP): enfileira conteúdos
 * programados e jobs recorrentes (PASSO 23), sempre com locks para evitar duplicidade.
 */
@Module({})
export class SchedulerModule {
  static register(config: AppConfig): DynamicModule {
    return {
      module: SchedulerModule,
      imports: [
        ConfigModule.forRoot(config),
        LoggingModule.forRoot('scheduler'),
        DatabaseModule,
        QueuesModule,
        HeartbeatModule.forRoot('scheduler'),
      ],
    };
  }
}
