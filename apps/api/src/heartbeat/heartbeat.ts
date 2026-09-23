import { redisKey } from '@aom/database';

export type BackgroundRole = 'worker' | 'scheduler';

export const HEARTBEAT_ROLES: readonly BackgroundRole[] = ['worker', 'scheduler'];

export function heartbeatKey(role: BackgroundRole, instance: string): string {
  return redisKey('heartbeat', role, instance);
}

export interface HeartbeatPayload {
  role: BackgroundRole;
  instance: string;
  pid: number;
  startedAt: string;
  at: string;
}
