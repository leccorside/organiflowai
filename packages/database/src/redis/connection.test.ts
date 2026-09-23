import { describe, expect, it } from 'vitest';
import { redisKey, toRedisOptions } from './connection';

describe('redisKey', () => {
  it('prefixa as partes com "aom"', () => {
    expect(redisKey('lock', 'publication:1')).toBe('aom:lock:publication:1');
  });
});

describe('toRedisOptions', () => {
  it('converte host, porta e database', () => {
    expect(toRedisOptions('redis://redis:6379/15')).toEqual({ host: 'redis', port: 6379, db: 15 });
  });

  it('usa porta 6379 e database 0 por padrão', () => {
    expect(toRedisOptions('redis://cache')).toEqual({ host: 'cache', port: 6379, db: 0 });
  });

  it('decodifica credenciais e habilita TLS em rediss://', () => {
    expect(toRedisOptions('rediss://user:p%40ss@cache:6380/2')).toEqual({
      host: 'cache',
      port: 6380,
      db: 2,
      username: 'user',
      password: 'p@ss',
      tls: {},
    });
  });

  it.each([
    ['URL malformada', 'nada'],
    ['protocolo inválido', 'http://redis:6379'],
    ['database inválido', 'redis://redis:6379/abc'],
  ])('rejeita %s', (_caso, url) => {
    expect(() => toRedisOptions(url)).toThrow(/REDIS_URL inválida/);
  });
});
