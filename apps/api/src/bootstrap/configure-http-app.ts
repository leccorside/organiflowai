import { RequestMethod } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import type { AppConfig } from '../config/app-config.js';
import { REQUEST_ID_HEADER } from '../logging/request-id.js';

export const API_PREFIX = 'api/v1';

/**
 * Configuração HTTP compartilhada entre `main.ts` e os testes de integração,
 * garantindo que os testes exercitem exatamente o mesmo pipeline da produção.
 */
export function configureHttpApp(app: NestExpressApplication, config: AppConfig): void {
  app.useLogger(app.get(Logger));
  app.enableShutdownHooks();

  // Atrás de proxy (nginx/load balancer), usa o IP real do cliente para rate limit e logs.
  app.set('trust proxy', config.http.trustProxy);
  app.disable('x-powered-by');
  app.useBodyParser('json', { limit: config.http.bodyLimit });
  app.useBodyParser('urlencoded', { limit: config.http.bodyLimit, extended: true });

  app.use(helmet());
  app.enableCors({
    // Lista explícita de origens; vazia = nenhuma origem externa permitida.
    origin: config.http.corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    exposedHeaders: [REQUEST_ID_HEADER, 'retry-after'],
    maxAge: 600,
  });

  app.setGlobalPrefix(API_PREFIX, {
    exclude: [
      { path: 'health', method: RequestMethod.GET },
      { path: 'health/live', method: RequestMethod.GET },
      { path: 'health/ready', method: RequestMethod.GET },
    ],
  });
}
