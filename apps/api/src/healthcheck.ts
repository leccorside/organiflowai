import { hostname } from 'node:os';
import { createRedisClient } from '@aom/database';
import { type BackgroundRole, HEARTBEAT_ROLES, heartbeatKey } from './heartbeat/heartbeat.js';

/**
 * Healthcheck de container dos processos sem HTTP: `node dist/healthcheck.js <worker|scheduler>`.
 * Sai com 0 se o heartbeat desta instância (hostname do container) existir no Redis.
 */
const role = process.argv[2] as BackgroundRole;
if (!HEARTBEAT_ROLES.includes(role) || !process.env.REDIS_URL) {
  process.stderr.write('uso: healthcheck <worker|scheduler> (requer REDIS_URL)\n');
  process.exit(2);
}

const redis = createRedisClient(process.env.REDIS_URL, {
  maxRetriesPerRequest: 1,
  connectTimeout: 3_000,
});

try {
  const alive = (await redis.exists(heartbeatKey(role, hostname()))) === 1;
  process.exitCode = alive ? 0 : 1;
} catch {
  process.exitCode = 1;
} finally {
  redis.disconnect();
}
