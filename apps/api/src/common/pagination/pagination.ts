import type { Paginated } from '@aom/types';
import { z } from 'zod';

export const MAX_PAGE_SIZE = 100;

/** Query string padrão das listagens: `?page=1&pageSize=20`. */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(20),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

/** Converte a paginação da API em `skip`/`take` do Prisma (usado pelos repositories). */
export function toSkipTake({ page, pageSize }: PaginationQuery): { skip: number; take: number } {
  return { skip: (page - 1) * pageSize, take: pageSize };
}

export function paginate<T>(
  data: T[],
  total: number,
  { page, pageSize }: PaginationQuery,
): Paginated<T> {
  return {
    data,
    meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  };
}
