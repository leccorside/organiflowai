import { InvalidConfigError, loadConfig } from './app-config.js';

const required = {
  DATABASE_URL: 'mysql://aom:secret-password@mysql:3306/aom',
  REDIS_URL: 'redis://redis:6379/0',
};

describe('loadConfig', () => {
  it('aplica padrões seguros quando só as variáveis obrigatórias existem', () => {
    const config = loadConfig(required);
    expect(config.env).toBe('development');
    expect(config.http).toEqual({
      port: 3000,
      corsOrigins: [],
      trustProxy: false,
      requestTimeoutMs: 30_000,
      bodyLimit: '1mb',
    });
    expect(config.database.allowPublicKeyRetrieval).toBe(false);
    expect(config.rateLimit).toEqual({ ttlMs: 60_000, max: 120 });
  });

  it('converte listas, booleanos e números', () => {
    const config = loadConfig({
      ...required,
      CORS_ORIGINS: 'http://localhost:5173, https://app.example.com ,',
      TRUST_PROXY: 'true',
      DATABASE_ALLOW_PUBLIC_KEY_RETRIEVAL: 'true',
      PORT: '8080',
      QUEUE_DEFAULT_ATTEMPTS: '5',
    });
    expect(config.http.corsOrigins).toEqual(['http://localhost:5173', 'https://app.example.com']);
    expect(config.http.trustProxy).toBe(true);
    expect(config.http.port).toBe(8080);
    expect(config.database.allowPublicKeyRetrieval).toBe(true);
    expect(config.queues.defaultAttempts).toBe(5);
  });

  it('trata variáveis vazias como ausentes (aplica o padrão)', () => {
    const config = loadConfig({ ...required, RATE_LIMIT_MAX: '', PORT: '', CORS_ORIGINS: '' });
    expect(config.rateLimit.max).toBe(120);
    expect(config.http.port).toBe(3000);
    expect(config.http.corsOrigins).toEqual([]);
    expect(() => loadConfig({ ...required, DATABASE_URL: '' })).toThrow(/DATABASE_URL/);
  });

  it('lista todas as variáveis inválidas de uma vez', () => {
    const load = () => loadConfig({ PORT: 'abc', TRUST_PROXY: 'sim' });
    expect(load).toThrow(InvalidConfigError);
    try {
      load();
    } catch (error) {
      const issues = (error as InvalidConfigError).issues.join('\n');
      expect(issues).toMatch(/DATABASE_URL/);
      expect(issues).toMatch(/REDIS_URL/);
      expect(issues).toMatch(/PORT/);
      expect(issues).toMatch(/TRUST_PROXY/);
    }
  });

  it('nunca inclui valores (possíveis secrets) na mensagem de erro', () => {
    let message = '';
    try {
      loadConfig({ ...required, RATE_LIMIT_MAX: 'secret-password' });
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toMatch(/RATE_LIMIT_MAX/);
    expect(message).not.toContain('secret-password');
  });
});
