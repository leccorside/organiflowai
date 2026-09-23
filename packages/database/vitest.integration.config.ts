import { defineConfig } from 'vitest/config';

// Testes de integração: exigem MySQL (TEST_DATABASE_URL) e Redis (TEST_REDIS_URL).
// Executar via: docker compose run --rm tools pnpm test:integration
export default defineConfig({
  test: {
    include: ['src/**/*.integration.test.ts'],
    globalSetup: ['src/test/integration-setup.ts'],
    // Os arquivos compartilham o mesmo banco/Redis de teste: execução sequencial.
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 120_000,
  },
});
