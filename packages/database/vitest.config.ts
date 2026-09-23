import { defineConfig } from 'vitest/config';

// Testes unitários: não dependem de MySQL/Redis (rodam no build `validate` e em CI).
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    exclude: ['src/**/*.integration.test.ts', 'src/generated/**'],
  },
});
