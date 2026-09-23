import { execFileSync } from 'node:child_process';

/**
 * Aplica as migrations no banco de teste antes dos testes de integração.
 * Nunca roda contra o banco de desenvolvimento.
 */
export default function globalSetup() {
  const testDatabaseUrl = process.env.TEST_DATABASE_URL;
  if (!testDatabaseUrl || !process.env.TEST_REDIS_URL) {
    throw new Error('TEST_DATABASE_URL e TEST_REDIS_URL são obrigatórias (ver .env.example)');
  }
  if (testDatabaseUrl === process.env.DATABASE_URL) {
    throw new Error('TEST_DATABASE_URL não pode ser igual a DATABASE_URL');
  }
  execFileSync('pnpm', ['--filter', '@aom/database', 'exec', 'prisma', 'migrate', 'deploy'], {
    env: { ...process.env, DATABASE_URL: testDatabaseUrl },
    stdio: 'inherit',
  });
}
