import type { Server } from 'node:http';
import { FEATURE_FLAGS, type ApiErrorBody } from '@aom/types';
import { Body, Controller, Get, type INestApplication, Module, Post, Query } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import type { Redis } from 'ioredis';
import request from 'supertest';
import { z } from 'zod';
import { AppModule } from '../src/app.module.js';
import { configureHttpApp } from '../src/bootstrap/configure-http-app.js';
import {
  paginate,
  paginationQuerySchema,
  type PaginationQuery,
} from '../src/common/pagination/pagination.js';
import { PrismaService } from '../src/database/prisma.service.js';
import { FeatureFlagsModule } from '../src/modules/feature-flags/feature-flags.module.js';
import { FeatureFlagsService } from '../src/modules/feature-flags/feature-flags.service.js';
import { testConfig, testRedis } from './utils.js';

const echoSchema = z.object({
  name: z.string().min(2),
  age: z.coerce.number().int().min(0).default(18),
});

/** Rotas usadas apenas nos testes para exercitar o pipeline HTTP completo. */
@Controller('_test')
class TestController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly flags: FeatureFlagsService,
  ) {}

  @Post('echo')
  echo(@Body({ schema: echoSchema }) body: z.infer<typeof echoSchema>) {
    return body;
  }

  @Get('items')
  items(@Query({ schema: paginationQuerySchema }) query: PaginationQuery) {
    return paginate(['a', 'b'], 42, query);
  }

  @Get('boom')
  boom() {
    throw new Error('conexão mysql://root:super-secret@db falhou');
  }

  @Get('slow')
  async slow() {
    await new Promise((resolve) => setTimeout(resolve, 1_000));
    return { done: true };
  }

  @Get('conflict')
  async conflict() {
    const data = { key: 'E2E_DUPLICATE' };
    await this.prisma.featureFlag.create({ data });
    await this.prisma.featureFlag.create({ data });
  }

  @Get('flags')
  async flagsState() {
    return {
      trends: await this.flags.isEnabled(FEATURE_FLAGS.ENABLE_TRENDS),
      autopublish: await this.flags.isEnabled(FEATURE_FLAGS.ENABLE_AUTOPUBLISH),
    };
  }
}

@Module({ imports: [FeatureFlagsModule], controllers: [TestController] })
class TestRoutesModule {}

const ALLOWED_ORIGIN = 'http://allowed.example';

describe('API HTTP (integração)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let redis: Redis;

  beforeAll(async () => {
    const config = testConfig({
      CORS_ORIGINS: ALLOWED_ORIGIN,
      RATE_LIMIT_MAX: '5',
      HTTP_REQUEST_TIMEOUT_MS: '300',
      HTTP_BODY_LIMIT: '1kb',
    });
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule.register(config), TestRoutesModule],
    }).compile();

    const nestApp = moduleRef.createNestApplication<NestExpressApplication>({
      bufferLogs: true,
      bodyParser: false,
    });
    configureHttpApp(nestApp, config);
    await nestApp.init();
    app = nestApp;
    prisma = app.get(PrismaService);
    redis = testRedis();
  });

  beforeEach(async () => {
    await redis.flushdb(); // zera rate limit e cache entre os testes
    await prisma.featureFlag.deleteMany();
  });

  afterAll(async () => {
    await app.close();
    await redis.quit();
  });

  const http = () => request(app.getHttpServer() as Server);
  const errorBody = (res: request.Response) => res.body as ApiErrorBody;

  describe('health', () => {
    it('/health/live responde sem consultar dependências', async () => {
      const res = await http().get('/health/live').expect(200);
      expect(res.body).toEqual({ status: 'ok' });
    });

    it('/health/ready verifica MySQL e Redis', async () => {
      const res = await http().get('/health/ready').expect(200);
      expect(res.body).toMatchObject({
        status: 'ok',
        checks: { database: { status: 'up' }, redis: { status: 'up' } },
      });
    });

    it('/health inclui versão, uptime e processos de background', async () => {
      const res = await http().get('/health').expect(200);
      expect(res.body).toMatchObject({
        status: 'ok',
        version: '0.1.0',
        background: { worker: { instances: 0 }, scheduler: { instances: 0 } },
      });
      expect(typeof (res.body as { uptimeSeconds: unknown }).uptimeSeconds).toBe('number');
    });

    it('fica fora do prefixo /api/v1 e do rate limit', async () => {
      await http().get('/api/v1/health/live').expect(404);
      for (let i = 0; i < 8; i++) {
        await http().get('/health/live').expect(200);
      }
    });
  });

  describe('segurança e cabeçalhos', () => {
    it('aplica headers do helmet e remove x-powered-by', async () => {
      const res = await http().get('/health/live');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-frame-options']).toBeDefined();
      expect(res.headers['x-powered-by']).toBeUndefined();
    });

    it('gera request id ou reaproveita um id seguro recebido', async () => {
      const generated = await http().get('/health/live');
      expect(generated.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);

      const forwarded = await http().get('/health/live').set('x-request-id', 'trace-abc-123');
      expect(forwarded.headers['x-request-id']).toBe('trace-abc-123');
    });

    it('CORS libera apenas origens configuradas', async () => {
      const allowed = await http()
        .options('/api/v1/_test/items')
        .set('Origin', ALLOWED_ORIGIN)
        .set('Access-Control-Request-Method', 'GET');
      expect(allowed.headers['access-control-allow-origin']).toBe(ALLOWED_ORIGIN);
      expect(allowed.headers['access-control-allow-credentials']).toBe('true');

      const denied = await http()
        .options('/api/v1/_test/items')
        .set('Origin', 'http://evil.example')
        .set('Access-Control-Request-Method', 'GET');
      expect(denied.headers['access-control-allow-origin']).toBeUndefined();
    });
  });

  describe('validação e respostas', () => {
    it('valida o corpo com Zod e retorna os campos inválidos', async () => {
      const res = await http().post('/api/v1/_test/echo').send({ name: 'x' }).expect(400);
      const body = res.body as ApiErrorBody;
      expect(body).toMatchObject({
        statusCode: 400,
        code: 'VALIDATION_ERROR',
        path: '/api/v1/_test/echo',
      });
      expect(body.details).toEqual([expect.objectContaining({ path: 'name' })]);
      expect(body.requestId).toBe(res.headers['x-request-id']);
    });

    it('aplica transformações e defaults do schema', async () => {
      const res = await http()
        .post('/api/v1/_test/echo')
        .send({ name: 'Ana', extra: 1 })
        .expect(201);
      expect(res.body).toEqual({ name: 'Ana', age: 18 });
    });

    it('converte a query string de paginação e monta o envelope', async () => {
      const res = await http().get('/api/v1/_test/items?page=2&pageSize=20').expect(200);
      expect(res.body).toEqual({
        data: ['a', 'b'],
        meta: { page: 2, pageSize: 20, total: 42, totalPages: 3 },
      });
      await http().get('/api/v1/_test/items?pageSize=500').expect(400);
    });
  });

  describe('tratamento de erros', () => {
    it('rota inexistente → 404 no formato padrão', async () => {
      const res = await http().get('/api/v1/nao-existe').expect(404);
      expect(res.body).toMatchObject({ statusCode: 404, code: 'NOT_FOUND' });
      expect(errorBody(res).timestamp).toBeDefined();
    });

    it('erro inesperado → 500 genérico, sem vazar detalhes internos', async () => {
      const res = await http().get('/api/v1/_test/boom').expect(500);
      expect(res.body).toMatchObject({ code: 'INTERNAL_ERROR', message: 'Internal server error' });
      expect(JSON.stringify(res.body)).not.toContain('super-secret');
    });

    it('requisição lenta → 408 pelo interceptor de timeout', async () => {
      const res = await http().get('/api/v1/_test/slow').expect(408);
      expect(errorBody(res).code).toBe('REQUEST_TIMEOUT');
    });

    it('violação de unicidade no banco → 409', async () => {
      const res = await http().get('/api/v1/_test/conflict').expect(409);
      expect(errorBody(res).code).toBe('CONFLICT');
    });

    it('corpo acima do limite → 413; JSON malformado → 400', async () => {
      await http()
        .post('/api/v1/_test/echo')
        .send({ name: 'x'.repeat(2_048) })
        .expect(413)
        .expect((res) => expect(errorBody(res).code).toBe('PAYLOAD_TOO_LARGE'));
      await http()
        .post('/api/v1/_test/echo')
        .set('Content-Type', 'application/json')
        .send('{"name":')
        .expect(400);
    });
  });

  describe('rate limit (Redis)', () => {
    it('bloqueia após o limite com 429 e Retry-After', async () => {
      for (let i = 0; i < 5; i++) {
        await http().get('/api/v1/_test/items').expect(200);
      }
      const res = await http().get('/api/v1/_test/items').expect(429);
      expect(errorBody(res).code).toBe('TOO_MANY_REQUESTS');
      expect(Number(res.headers['retry-after'])).toBeGreaterThan(0);
    });

    it('armazena os contadores no Redis (compartilhados entre instâncias)', async () => {
      await http().get('/api/v1/_test/items').expect(200);
      expect(await redis.keys('aom:throttle:*')).not.toHaveLength(0);
    });
  });

  describe('feature flags', () => {
    it('flag inexistente é tratada como desabilitada; valor vem do banco com cache', async () => {
      await prisma.featureFlag.create({
        data: { key: FEATURE_FLAGS.ENABLE_TRENDS, enabled: true },
      });

      const first = await http().get('/api/v1/_test/flags').expect(200);
      expect(first.body).toEqual({ trends: true, autopublish: false });

      // Alteração direta no banco não aparece até o cache ser invalidado.
      await prisma.featureFlag.update({
        where: { key: FEATURE_FLAGS.ENABLE_TRENDS },
        data: { enabled: false },
      });
      const trends = async () =>
        ((await http().get('/api/v1/_test/flags')).body as { trends: boolean }).trends;
      expect(await trends()).toBe(true);

      await app.get(FeatureFlagsService).invalidateCache();
      expect(await trends()).toBe(false);
    });
  });
});
