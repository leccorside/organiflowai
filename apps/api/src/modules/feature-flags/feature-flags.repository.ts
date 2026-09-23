import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';

export interface FeatureFlagRecord {
  key: string;
  enabled: boolean;
  description: string | null;
}

/** Acesso a dados das feature flags (única camada que conhece o Prisma neste módulo). */
@Injectable()
export class FeatureFlagsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<FeatureFlagRecord[]> {
    return this.prisma.featureFlag.findMany({
      select: { key: true, enabled: true, description: true },
      orderBy: { key: 'asc' },
    });
  }
}
