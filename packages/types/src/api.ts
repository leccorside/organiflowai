/** Metadados de paginação retornados pelas listagens da API. */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/** Envelope padrão das listagens paginadas: `{ data, meta }`. */
export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Códigos de erro estáveis da API. O frontend traduz pelo código (i18n);
 * `message` é apenas um texto padrão em inglês.
 */
export const API_ERROR_CODES = [
  'BAD_REQUEST',
  'VALIDATION_ERROR',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'REQUEST_TIMEOUT',
  'PAYLOAD_TOO_LARGE',
  'TOO_MANY_REQUESTS',
  'SERVICE_UNAVAILABLE',
  'INTERNAL_ERROR',
] as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

export interface ApiValidationIssue {
  /** Caminho do campo, ex.: `address.city` (vazio para erros no objeto raiz). */
  path: string;
  message: string;
}

/** Corpo padrão de toda resposta de erro da API. */
export interface ApiErrorBody {
  statusCode: number;
  code: ApiErrorCode;
  message: string;
  details?: ApiValidationIssue[];
  requestId?: string;
  path: string;
  timestamp: string;
}
