import { Writable } from 'node:stream';
import { pino } from 'pino';
import { REDACT_CENSOR, REDACT_PATHS } from './redact.js';
import { resolveRequestId } from './request-id.js';

function captureLog(payload: Record<string, unknown>): Record<string, unknown> {
  const lines: string[] = [];
  const stream = new Writable({
    write(chunk: Buffer, _encoding, callback) {
      lines.push(chunk.toString());
      callback();
    },
  });
  pino({ redact: { paths: REDACT_PATHS, censor: REDACT_CENSOR } }, stream).info(payload);
  return JSON.parse(lines[0] ?? '{}') as Record<string, unknown>;
}

describe('redaction de secrets nos logs', () => {
  it('remove senhas, tokens e API keys na raiz e em objetos de primeiro nível', () => {
    const log = captureLog({
      password: 'p1',
      apiKey: 'sk-live-123',
      body: { email: 'a@b.com', password: 'p2', refreshToken: 't1' },
      provider: { name: 'openai', apiKey: 'sk-live-456' },
    });
    const serialized = JSON.stringify(log);
    for (const secret of ['p1', 'p2', 't1', 'sk-live-123', 'sk-live-456']) {
      expect(serialized).not.toContain(secret);
    }
    expect(log.body).toEqual({
      email: 'a@b.com',
      password: REDACT_CENSOR,
      refreshToken: REDACT_CENSOR,
    });
  });

  it('remove headers de autenticação', () => {
    const log = captureLog({
      req: { headers: { authorization: 'Bearer abc', cookie: 'sid=1', 'user-agent': 'jest' } },
    });
    expect(log.req).toEqual({
      headers: { authorization: REDACT_CENSOR, cookie: REDACT_CENSOR, 'user-agent': 'jest' },
    });
  });
});

describe('resolveRequestId', () => {
  it('reaproveita um id recebido seguro', () => {
    expect(resolveRequestId('abc-123_DEF-456')).toBe('abc-123_DEF-456');
  });

  it.each([undefined, '', 'curto', 'com espaço inválido', 'x'.repeat(65), 'a\nb-injection'])(
    'gera um UUID novo para valor ausente ou inseguro (%p)',
    (incoming) => {
      expect(resolveRequestId(incoming)).toMatch(/^[0-9a-f-]{36}$/);
    },
  );
});
