import { Prisma } from './generated/prisma/client';

/** Códigos de erro do Prisma tratados pela aplicação. */
export const PRISMA_ERROR_CODES = {
  UNIQUE_CONSTRAINT: 'P2002',
  RECORD_NOT_FOUND: 'P2025',
} as const;

/**
 * Retorna o código de um erro conhecido do Prisma (ex.: "P2002") ou `undefined`.
 * Encapsula a classe de erro do Prisma para que os consumidores não dependam dela.
 */
export function getPrismaErrorCode(error: unknown): string | undefined {
  return error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined;
}
