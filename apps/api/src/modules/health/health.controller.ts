import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import type { Response } from 'express';
import { HealthService } from './health.service.js';

/**
 * Health checks (fora do prefixo /api/v1 e do rate limit).
 * - /health/live  → o processo responde (liveness; não consulta dependências)
 * - /health/ready → MySQL e Redis acessíveis (readiness; 503 se algum falhar)
 * - /health       → readiness + versão, uptime e processos de background ativos
 */
@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get('live')
  live(): { status: 'ok' } {
    return { status: 'ok' };
  }

  @Get('ready')
  async ready(@Res({ passthrough: true }) res: Response) {
    const report = await this.health.readiness();
    res.status(report.status === 'ok' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE);
    return report;
  }

  @Get()
  async details(@Res({ passthrough: true }) res: Response) {
    const report = await this.health.health();
    res.status(report.status === 'ok' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE);
    return report;
  }
}
