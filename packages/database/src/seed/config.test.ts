import { describe, expect, it } from 'vitest';
import { readSeedConfig } from './config';

const valid = {
  SEED_SUPER_ADMIN_EMAIL: ' Admin@Example.com ',
  SEED_SUPER_ADMIN_PASSWORD: 'uma-senha-forte-123',
};

describe('readSeedConfig', () => {
  it('normaliza o e-mail e usa nome padrão', () => {
    expect(readSeedConfig(valid)).toEqual({
      superAdmin: {
        email: 'admin@example.com',
        name: 'Super Admin',
        password: 'uma-senha-forte-123',
      },
    });
  });

  it('aceita nome customizado', () => {
    const config = readSeedConfig({ ...valid, SEED_SUPER_ADMIN_NAME: 'Maria' });
    expect(config.superAdmin.name).toBe('Maria');
  });

  it('recusa e-mail ausente ou inválido', () => {
    expect(() => readSeedConfig({ ...valid, SEED_SUPER_ADMIN_EMAIL: undefined })).toThrow(
      /SEED_SUPER_ADMIN_EMAIL/,
    );
    expect(() => readSeedConfig({ ...valid, SEED_SUPER_ADMIN_EMAIL: 'admin' })).toThrow(
      /SEED_SUPER_ADMIN_EMAIL/,
    );
  });

  it('recusa senha curta', () => {
    expect(() => readSeedConfig({ ...valid, SEED_SUPER_ADMIN_PASSWORD: 'curta' })).toThrow(
      /ao menos 12/,
    );
  });

  it.each(['change-me-123456', 'MyChangeMePassword'])(
    'recusa valor de exemplo mesmo com tamanho suficiente (%s)',
    (password) => {
      expect(() => readSeedConfig({ ...valid, SEED_SUPER_ADMIN_PASSWORD: password })).toThrow(
        /valor de exemplo/,
      );
    },
  );

  it('nunca inclui a senha na mensagem de erro', () => {
    const password = 'segredo';
    expect(() => readSeedConfig({ SEED_SUPER_ADMIN_PASSWORD: password })).toThrow(
      expect.objectContaining({ message: expect.not.stringContaining(password) as string }),
    );
  });

  it('reporta todos os erros de uma vez', () => {
    expect(() => readSeedConfig({})).toThrow(/SEED_SUPER_ADMIN_EMAIL.*SEED_SUPER_ADMIN_PASSWORD/);
  });
});
