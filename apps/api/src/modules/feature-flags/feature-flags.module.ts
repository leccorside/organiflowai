import { Module } from '@nestjs/common';
import { FeatureFlagsRepository } from './feature-flags.repository.js';
import { FeatureFlagsService } from './feature-flags.service.js';

@Module({
  providers: [FeatureFlagsRepository, FeatureFlagsService],
  exports: [FeatureFlagsService],
})
export class FeatureFlagsModule {}
