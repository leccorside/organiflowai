import { getPrismaErrorCode, PRISMA_ERROR_CODES } from '@aom/database';
import type { ApiErrorBody, ApiErrorCode, ApiValidationIssue } from '@aom/types';
import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { errorCodeForStatus } from './error-codes.js';

interface NormalizedError {
  status: number;
  code: ApiErrorCode;
  message: string;
  details?: ApiValidationIssue[];
}

/** Payload aceito por exceções HTTP lançadas pela aplicação (ver ValidationException). */
interface HttpExceptionPayload {
  message?: string | string[];
  code?: ApiErrorCode;
  details?: ApiValidationIssue[];
}

/**
 * Erros no formato `http-errors` (ex.: body-parser: corpo acima do limite → 413, JSON inválido → 400).
 * `expose=true` indica que a mensagem é segura para o cliente.
 */
function isExposedClientError(error: unknown): error is { status: number; message: string } {
  if (typeof error !== 'object' || error === null) return false;
  const { status, expose } = error as { status?: unknown; expose?: unknown };
  return typeof status === 'number' && status >= 400 && status < 500 && expose === true;
}

/**
 * Converte qualquer exceção no corpo padrão `ApiErrorBody`.
 * Erros inesperados (500) são logados com stack, mas nunca expõem detalhes internos ao cliente.
 */
@Catch()
@Injectable()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(AllExceptionsFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<Request & { id?: string }>();
    const response = http.getResponse<Response>();

    const error = this.normalize(exception);
    if (error.status >= 500) {
      this.logger.error(
        { err: exception, requestId: request.id },
        'Erro não tratado na requisição',
      );
    }

    const body: ApiErrorBody = {
      statusCode: error.status,
      code: error.code,
      message: error.message,
      ...(error.details ? { details: error.details } : {}),
      ...(request.id ? { requestId: request.id } : {}),
      path: request.originalUrl ?? request.url,
      timestamp: new Date().toISOString(),
    };
    response.status(error.status).json(body);
  }

  private normalize(exception: unknown): NormalizedError {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();
      const { message, code, details } =
        typeof payload === 'string' ? { message: payload } : (payload as HttpExceptionPayload);
      return {
        status,
        code: code ?? errorCodeForStatus(status),
        message: Array.isArray(message) ? message.join('; ') : (message ?? exception.message),
        ...(details ? { details } : {}),
      };
    }

    if (isExposedClientError(exception)) {
      return {
        status: exception.status,
        code: errorCodeForStatus(exception.status),
        message: exception.message,
      };
    }

    const prismaCode = getPrismaErrorCode(exception);
    if (prismaCode === PRISMA_ERROR_CODES.UNIQUE_CONSTRAINT) {
      return { status: HttpStatus.CONFLICT, code: 'CONFLICT', message: 'Resource already exists' };
    }
    if (prismaCode === PRISMA_ERROR_CODES.RECORD_NOT_FOUND) {
      return { status: HttpStatus.NOT_FOUND, code: 'NOT_FOUND', message: 'Resource not found' };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    };
  }
}
