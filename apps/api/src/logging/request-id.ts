import { randomUUID } from 'node:crypto';

export const REQUEST_ID_HEADER = 'x-request-id';

// Aceita um id recebido (ex.: de um proxy) apenas se for curto e seguro para logs/headers.
const SAFE_REQUEST_ID = /^[A-Za-z0-9_-]{8,64}$/;

export function resolveRequestId(incoming: string | string[] | undefined): string {
  const candidate = Array.isArray(incoming) ? incoming[0] : incoming;
  return candidate !== undefined && SAFE_REQUEST_ID.test(candidate) ? candidate : randomUUID();
}
