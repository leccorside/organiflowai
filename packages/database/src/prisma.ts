import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import type { PoolConfig } from 'mariadb';
import { PrismaClient } from './generated/prisma/client';

export interface DatabaseConnectionOptions {
  /** Tamanho máximo do pool de conexões. Padrão: 10. */
  connectionLimit?: number;
  /**
   * Permite obter a chave pública do servidor para `caching_sha2_password` em conexões sem TLS.
   * Necessário no ambiente de desenvolvimento (rede Docker interna); em produção use TLS.
   */
  allowPublicKeyRetrieval?: boolean;
}

/**
 * Converte uma URL `mysql://usuario:senha@host:porta/banco` (mesmo formato usado pelas
 * migrations) na configuração de pool do driver MariaDB usado pelo adapter do Prisma.
 */
export function toPoolConfig(
  databaseUrl: string,
  { connectionLimit = 10, allowPublicKeyRetrieval = false }: DatabaseConnectionOptions = {},
): PoolConfig {
  let url: URL;
  try {
    url = new URL(databaseUrl);
  } catch {
    throw new Error('DATABASE_URL inválida: esperado mysql://usuario:senha@host:porta/banco');
  }

  if (url.protocol !== 'mysql:' && url.protocol !== 'mariadb:') {
    throw new Error(`DATABASE_URL inválida: protocolo "${url.protocol}" não suportado`);
  }

  const database = decodeURIComponent(url.pathname.replace(/^\//, ''));
  if (database === '') {
    throw new Error('DATABASE_URL inválida: nome do banco ausente');
  }

  return {
    host: url.hostname,
    port: url.port === '' ? 3306 : Number(url.port),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database,
    connectionLimit,
    allowPublicKeyRetrieval,
  };
}

export function createPrismaClient(
  databaseUrl: string,
  options: DatabaseConnectionOptions = {},
): PrismaClient {
  const adapter = new PrismaMariaDb(toPoolConfig(databaseUrl, options));
  return new PrismaClient({ adapter });
}
