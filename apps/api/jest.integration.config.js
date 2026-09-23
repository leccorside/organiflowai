import { baseConfig } from './jest.config.js';

/**
 * Testes de integração: sobem a aplicação real contra MySQL (TEST_DATABASE_URL)
 * e Redis (TEST_REDIS_URL). Executar via `docker compose run --rm tools pnpm test:integration`.
 */
export default {
  ...baseConfig,
  testMatch: ['<rootDir>/test/**/*.e2e-spec.ts'],
  globalSetup: '<rootDir>/test/global-setup.js',
  maxWorkers: 1,
  testTimeout: 30_000,
};
