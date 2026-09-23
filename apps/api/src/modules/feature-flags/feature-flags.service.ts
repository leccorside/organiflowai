import { cacheDelete, cacheGetOrSet } from '@aom/database';
import type { FeatureFlagKey } from '@aom/types';
import { Inject, Injectable } from '@nestjs/common';
import { APP_CONFIG, type AppConfig } from '../../config/app-config.js';
import { RedisService } from '../../database/redis.service.js';
import { FeatureFlagsRepository } from './feature-flags.repository.js';

const CACHE_KEY = 'feature-flags';

/**
 * Consulta de feature flags para os demais módulos (ex.: ENABLE_AUTOPUBLISH).
 * Regras: flag inexistente = desabilitada (fail-safe); leitura em cache Redis
 * compartilhado entre processos, invalidado quando uma flag é alterada (PASSO 9).
 */
@Injectable()
export class FeatureFlagsService {
  constructor(
    private readonly repository: FeatureFlagsRepository,
    private readonly redis: RedisService,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  async isEnabled(key: FeatureFlagKey): Promise<boolean> {
    const flags = await this.getAll();
    return flags[key] ?? false;
  }

  async getAll(): Promise<Partial<Record<string, boolean>>> {
    return cacheGetOrSet(
      this.redis.client,
      CACHE_KEY,
      this.config.featureFlags.cacheTtlSeconds,
      async () =>
        Object.fromEntries(
          (await this.repository.findAll()).map((flag) => [flag.key, flag.enabled]),
        ),
    );
  }

  async invalidateCache(): Promise<void> {
    await cacheDelete(this.redis.client, CACHE_KEY);
  }
}
