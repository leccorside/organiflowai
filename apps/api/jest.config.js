// Jest em modo ESM (NestJS 12 é ESM-only): executar com NODE_OPTIONS=--experimental-vm-modules.
// Transpilação com SWC (mesmo .swcrc do build: decorators + metadata para o DI do Nest).

/** @type {import('jest').Config} */
export const baseConfig = {
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  transform: { '^.+\\.ts$': ['@swc/jest'] },
  // Imports relativos usam ".js" (padrão ESM do Node); no teste, apontam para o .ts.
  moduleNameMapper: { '^(\\.{1,2}/.*)\\.js$': '$1' },
  setupFiles: ['<rootDir>/test/preload-esm.js'],
  clearMocks: true,
};

/** Testes unitários: sem MySQL/Redis. */
export default {
  ...baseConfig,
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
};
