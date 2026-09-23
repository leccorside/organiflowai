import { paginate, paginationQuerySchema, toSkipTake } from './pagination.js';

describe('paginação', () => {
  it('aplica padrões e converte strings da query string', () => {
    expect(paginationQuerySchema.parse({})).toEqual({ page: 1, pageSize: 20 });
    expect(paginationQuerySchema.parse({ page: '3', pageSize: '50' })).toEqual({
      page: 3,
      pageSize: 50,
    });
  });

  it.each([{ page: '0' }, { pageSize: '101' }, { page: '1.5' }, { pageSize: 'abc' }])(
    'rejeita valores inválidos (%p)',
    (query) => {
      expect(paginationQuerySchema.safeParse(query).success).toBe(false);
    },
  );

  it('calcula skip/take', () => {
    expect(toSkipTake({ page: 1, pageSize: 20 })).toEqual({ skip: 0, take: 20 });
    expect(toSkipTake({ page: 3, pageSize: 25 })).toEqual({ skip: 50, take: 25 });
  });

  it('monta o envelope com metadados', () => {
    expect(paginate(['a', 'b'], 42, { page: 2, pageSize: 20 })).toEqual({
      data: ['a', 'b'],
      meta: { page: 2, pageSize: 20, total: 42, totalPages: 3 },
    });
    expect(paginate([], 0, { page: 1, pageSize: 20 }).meta.totalPages).toBe(0);
  });
});
