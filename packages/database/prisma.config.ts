import { defineConfig } from 'prisma/config';

// O Prisma 7 não carrega `.env` automaticamente: as variáveis chegam pelo ambiente
// do container (docker compose). `generate` não precisa de conexão, por isso a URL
// não é obrigatória aqui; migrate/seed falham com erro claro se ela estiver ausente.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx src/seed/run.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL ?? '',
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
});
