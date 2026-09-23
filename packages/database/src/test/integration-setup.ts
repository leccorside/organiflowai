import { execFileSync } from 'node:child_process';

/**
 * Global setup dos testes de integração: aplica as migrations no banco de teste.
 * Usa um banco dedicado (TEST_DATABASE_URL) para nunca tocar nos dados de desenvolvimento.
 */
export default function setup(): void {
  const testDatabaseUrl = process.env.TEST_DATABASE_URL;
  if (!testDatabaseUrl) {
    throw new Error('TEST_DATABASE_URL não definida (ver .env.example)');
  }
  if (testDatabaseUrl === process.env.DATABASE_URL) {
    throw new Error('TEST_DATABASE_URL não pode ser igual a DATABASE_URL');
  }
  if (!process.env.TEST_REDIS_URL) {
    throw new Error('TEST_REDIS_URL não definida (ver .env.example)');
  }

  execFileSync('pnpm', ['exec', 'prisma', 'migrate', 'deploy'], {
    env: { ...process.env, DATABASE_URL: testDatabaseUrl },
    stdio: 'inherit',
  });
}
