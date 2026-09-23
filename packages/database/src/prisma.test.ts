import { describe, expect, it } from 'vitest';
import { toPoolConfig } from './prisma';

describe('toPoolConfig', () => {
  it('converte a URL mysql:// em configuração de pool', () => {
    expect(toPoolConfig('mysql://aom:s3nha@mysql:3306/aom')).toEqual({
      host: 'mysql',
      port: 3306,
      user: 'aom',
      password: 's3nha',
      database: 'aom',
      connectionLimit: 10,
      allowPublicKeyRetrieval: false,
    });
  });

  it('decodifica caracteres especiais de usuário e senha', () => {
    const config = toPoolConfig('mysql://us%40er:p%40ss%3Aw%2Frd@db/app');
    expect(config.user).toBe('us@er');
    expect(config.password).toBe('p@ss:w/rd');
  });

  it('usa a porta 3306 quando omitida e aplica as opções', () => {
    const config = toPoolConfig('mysql://u:p@db/app', {
      connectionLimit: 2,
      allowPublicKeyRetrieval: true,
    });
    expect(config.port).toBe(3306);
    expect(config.connectionLimit).toBe(2);
    expect(config.allowPublicKeyRetrieval).toBe(true);
  });

  it.each([
    ['URL malformada', 'not-a-url'],
    ['protocolo não suportado', 'postgres://u:p@db/app'],
    ['banco ausente', 'mysql://u:p@db/'],
  ])('rejeita %s', (_caso, url) => {
    expect(() => toPoolConfig(url)).toThrow(/DATABASE_URL inválida/);
  });

  it('não expõe a senha na mensagem de erro', () => {
    expect(() => toPoolConfig('postgres://u:segredo@db/app')).toThrow(
      expect.objectContaining({ message: expect.not.stringContaining('segredo') as string }),
    );
  });
});
