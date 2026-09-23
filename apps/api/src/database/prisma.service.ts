import { createPrismaAdapter, PrismaClient } from '@aom/database';
import { Inject, Injectable, type OnApplicationShutdown } from '@nestjs/common';
import { APP_CONFIG, type AppConfig } from '../config/app-config.js';

/**
 * Prisma Client com ciclo de vida do Nest. A conexão é aberta sob demanda
 * (na primeira consulta) e encerrada na última fase do shutdown.
 * Somente repositories devem injetar este serviço.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnApplicationShutdown {
  constructor(@Inject(APP_CONFIG) config: AppConfig) {
    super({
      adapter: createPrismaAdapter(config.database.url, {
        connectionLimit: config.database.connectionLimit,
        allowPublicKeyRetrieval: config.database.allowPublicKeyRetrieval,
      }),
    });
  }

  async onApplicationShutdown(): Promise<void> {
    await this.$disconnect();
  }
}
