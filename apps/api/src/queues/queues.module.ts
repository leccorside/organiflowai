import { toRedisOptions } from '@aom/database';
import { QUEUE_NAMES } from '@aom/types';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import type { QueueOptions, RedisOptions } from 'bullmq';
import { APP_CONFIG, type AppConfig } from '../config/app-config.js';

/** Prefixo das chaves do BullMQ no Redis (separado das chaves `aom:*` da aplicação). */
export const QUEUE_PREFIX = 'aom-bull';

const queues = Object.values(QUEUE_NAMES).map((name) => ({ name }));

/**
 * Registra todas as filas BullMQ (produtores). Processadores são adicionados nos passos
 * de cada domínio e rodam no processo `worker`.
 *
 * Padrões de job (sobrescrevíveis por job): retry com backoff exponencial e retenção
 * limitada de jobs concluídos/falhos (jobs falhos ficam disponíveis para inspeção/replay).
 */
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [APP_CONFIG],
      useFactory: (config: AppConfig): QueueOptions => {
        // BullMQ cria e gerencia as próprias conexões; workers exigem maxRetriesPerRequest=null.
        const connection: RedisOptions = {
          ...toRedisOptions(config.redis.url),
          maxRetriesPerRequest: null,
        };
        return {
          connection,
          prefix: QUEUE_PREFIX,
          defaultJobOptions: {
            attempts: config.queues.defaultAttempts,
            backoff: { type: 'exponential', delay: config.queues.backoffDelayMs },
            removeOnComplete: { count: config.queues.removeOnComplete },
            removeOnFail: { count: config.queues.removeOnFail },
          },
        };
      },
    }),
    BullModule.registerQueue(...queues),
  ],
  exports: [BullModule],
})
export class QueuesModule {}
