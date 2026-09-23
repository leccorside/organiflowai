import {
  type CallHandler,
  type ExecutionContext,
  Inject,
  Injectable,
  type NestInterceptor,
  RequestTimeoutException,
} from '@nestjs/common';
import { catchError, type Observable, throwError, timeout, TimeoutError } from 'rxjs';
import { APP_CONFIG, type AppConfig } from '../../config/app-config.js';

/** Encerra requisições HTTP que excedem `HTTP_REQUEST_TIMEOUT_MS` com 408. */
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {}

  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      timeout(this.config.http.requestTimeoutMs),
      catchError((error: unknown) =>
        throwError(() =>
          error instanceof TimeoutError ? new RequestTimeoutException('Request timed out') : error,
        ),
      ),
    );
  }
}
