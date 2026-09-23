import type { IncomingMessage, ServerResponse } from 'node:http';
import { type DynamicModule, Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { APP_CONFIG, type AppConfig } from '../config/app-config.js';
import { REDACT_CENSOR, REDACT_PATHS } from './redact.js';
import { REQUEST_ID_HEADER, resolveRequestId } from './request-id.js';

export type ProcessRole = 'api' | 'worker' | 'scheduler';

/**
 * Logs estruturados em JSON (pino). Cada linha inclui `service` (papel do processo)
 * e, nas requisições HTTP, `req.id` = request id (também devolvido no header X-Request-Id).
 */
@Module({})
export class LoggingModule {
  static forRoot(role: ProcessRole): DynamicModule {
    return {
      module: LoggingModule,
      imports: [
        LoggerModule.forRootAsync({
          inject: [APP_CONFIG],
          useFactory: (config: AppConfig) => ({
            pinoHttp: {
              level: config.log.level,
              base: { service: role },
              messageKey: 'message',
              timestamp: () => `,"time":"${new Date().toISOString()}"`,
              formatters: { level: (label: string) => ({ level: label }) },
              redact: { paths: REDACT_PATHS, censor: REDACT_CENSOR },
              genReqId: (req: IncomingMessage, res: ServerResponse) => {
                const id = resolveRequestId(req.headers[REQUEST_ID_HEADER]);
                res.setHeader(REQUEST_ID_HEADER, id);
                return id;
              },
              // Health checks são chamados a cada poucos segundos: não poluem os logs.
              autoLogging: {
                ignore: (req: IncomingMessage) => req.url?.startsWith('/health') ?? false,
              },
              customLogLevel: (_req: IncomingMessage, res: ServerResponse, error?: Error) =>
                error || res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info',
              serializers: {
                req: (req: { id: string; method: string; url: string }) => ({
                  id: req.id,
                  method: req.method,
                  url: req.url,
                }),
                res: (res: { statusCode: number }) => ({ statusCode: res.statusCode }),
              },
            },
          }),
        }),
      ],
    };
  }
}
