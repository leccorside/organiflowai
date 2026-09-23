import { type DynamicModule, Module } from '@nestjs/common';
import type { BackgroundRole } from './heartbeat.js';
import { HEARTBEAT_ROLE, HeartbeatService } from './heartbeat.service.js';

@Module({})
export class HeartbeatModule {
  static forRoot(role: BackgroundRole): DynamicModule {
    return {
      module: HeartbeatModule,
      providers: [{ provide: HEARTBEAT_ROLE, useValue: role }, HeartbeatService],
    };
  }
}
