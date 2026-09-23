# CONTEXTO.md — Memória Técnica do Projeto

> Ler este arquivo e o `PASSOS.md` antes de iniciar qualquer passo. Consultar `DOCUMENTACAO.md` quando necessário.
> Antes de cada passo, verificar o estado real do código e o `git status`/`git diff` (o usuário pode alterar código manualmente entre passos).

---

## O que é o sistema

**AI Organic Marketing Automation**: plataforma para criar, organizar, agendar, publicar, distribuir, analisar e otimizar conteúdo de marketing **orgânico** (sem anúncios pagos) usando inteligência artificial, em vários canais digitais.

## Objetivo principal

Permitir que uma empresa cadastre a marca, configure canais e provedores de IA (com prioridade e failover), defina objetivos, crie campanhas e deixe a IA gerar a estratégia e os conteúdos adaptados por canal. O usuário aprova (ou usa o modo automático), o sistema agenda e publica pelas integrações permitidas, coleta analytics e usa os resultados para melhorar os próximos conteúdos.

## Arquitetura atual

Monorepo **pnpm workspaces** com tooling, pacotes compartilhados e infraestrutura Docker (MySQL 8.4 e Redis 8 via `docker compose up -d`, `Dockerfile` multi-stage, serviço `tools` para rodar pnpm sem Node no host). A camada de dados existe em `@aom/database`: schema Prisma com migration `init`, seed idempotente e utilitários Redis (lock, cache, rate limit).

**Backend (`apps/api`) funcionando**: NestJS 12 (ESM) — Modular Monolith executado em 3 processos/containers a partir do mesmo código: `backend` (HTTP), `worker` e `scheduler` (sem HTTP, com heartbeat no Redis). `docker compose up -d` sobe tudo (setup → backend/worker/scheduler saudáveis, hot reload por polling). Ainda **sem módulos de domínio** (auth, marcas etc.) e **sem frontend** (PASSO 5).

## Tecnologias

| Camada           | Tecnologia                                                                                         | Status  |
| ---------------- | -------------------------------------------------------------------------------------------------- | ------- |
| Runtime / pacote | Node.js 24, pnpm 12.6 (fixado em `packageManager`)                                                 | Em uso  |
| Linguagem        | TypeScript **6.0** (não 7 — ver Limitações)                                                        | Em uso  |
| Qualidade        | ESLint 10 (flat config, type-aware via typescript-eslint 8), Prettier 3                            | Em uso  |
| Pacotes internos | tsup 8 (build ESM + CJS + `.d.ts`), Vitest 5                                                       | Em uso  |
| Frontend         | React, TypeScript, Vite, React Router, TanStack Query, Zustand, React Hook Form, Zod, Tailwind CSS | PASSO 5 |
| Backend          | NestJS 12.0.x (ESM, Express 5), nestjs-pino, throttler, @nestjs/bullmq, helmet, Zod 4              | Em uso  |
| Build backend    | SWC (build, dev via @swc-node/register, Jest via @swc/jest); nodemon polling; tsc só typecheck     | Em uso  |
| Banco            | MySQL 8.4 + Prisma 7.10 (adapter mariadb, Query Compiler)                                          | Em uso  |
| Cache/filas      | Redis 8 + ioredis 6 + BullMQ 6 (filas registradas, processadores por domínio)                      | Em uso  |
| Senhas           | argon2id (`@node-rs/argon2`)                                                                       | Em uso  |
| Infra            | Docker / docker compose, MySQL 8.4 LTS, Redis 8                                                    | Em uso  |
| Testes           | Jest ESM (backend) · Vitest (pacotes) — em uso; Vitest + RTL (frontend), Playwright (E2E)          | Parcial |

## Serviços existentes

| Serviço     | Onde                                      | Observação                                                                              |
| ----------- | ----------------------------------------- | --------------------------------------------------------------------------------------- |
| `mysql`     | `127.0.0.1:3307` (`MYSQL_HOST_PORT`)      | utf8mb4, timezone `+00:00`, volume `mysql_data`; bancos `aom`, `aom_test`, `aom_shadow` |
| `redis`     | `127.0.0.1:6380` (`REDIS_HOST_PORT`)      | AOF + `noeviction` (BullMQ), volume `redis_data`                                        |
| `tools`     | `docker compose run --rm tools <comando>` | Perfil `tools`; bind mount do código, `node_modules` em volumes                         |
| `setup`     | executa a cada `up` e sai                 | `pnpm install` + build dos pacotes + `migrate deploy`                                   |
| `backend`   | `127.0.0.1:3000` (`API_PORT`)             | API HTTP; `/health`, `/health/live`, `/health/ready`; rotas sob `/api/v1`               |
| `worker`    | —                                         | Filas BullMQ (sem processadores ainda); heartbeat                                       |
| `scheduler` | —                                         | Agendamentos (PASSO 23); heartbeat                                                      |

Portas padrão fora de 3306/6379 porque o host já tem outro projeto usando 6379.

## Estrutura principal

```text
apps/
  api/                # @aom/api — NestJS 12 ESM: main.ts (HTTP), main.worker.ts, main.scheduler.ts, healthcheck.ts
    src/config        #   env Zod + AppConfig (APP_CONFIG)
    src/logging       #   pino, redaction, request id
    src/database      #   PrismaService, RedisService
    src/common        #   errors (filter), validation (pipe), interceptors, pagination
    src/rate-limit    #   throttler + storage Redis
    src/queues        #   registro das 9 filas BullMQ
    src/heartbeat     #   heartbeat de worker/scheduler
    src/modules       #   health, feature-flags (domínios nos próximos passos)
    test/             #   integração (*.e2e-spec.ts), preload-esm, global-setup
packages/
  config/             # @aom/config — tsconfig base e de bibliotecas
  types/              # @aom/types — contratos de domínio (roles, status, canais, IA, filas)
  shared/             # @aom/shared — utilitários puros (maskSecret)
  database/           # @aom/database — SOMENTE servidor: Prisma (schema, migrations, seed) + Redis
docker/mysql/initdb/  # cria <db>_test e <db>_shadow na 1ª inicialização do MySQL
eslint.config.mjs     # lint único na raiz, type-aware
pnpm-workspace.yaml   # workspaces + allowBuilds (aprovados/negados explicitamente)
Dockerfile            # multi-stage: base, dev, build, validate, api-build, api (produção)
docker-compose.yml    # mysql, redis, setup, backend, worker, scheduler, tools
```

## Funcionalidades implementadas

- `@aom/types`: `ROLES`, `ORGANIZATION_ROLES`, `FEATURE_FLAGS`, `CONTENT_STATUSES`, `AUTONOMY_MODES`, `CHANNEL_TYPES`, `AI_PROVIDERS`, `DEFAULT_AI_PROVIDER_PRIORITY`, `CIRCUIT_STATES`, `QUEUE_NAMES` (+ tipos derivados).
- `@aom/shared`: `maskSecret()` — exibe API Keys como `••••••••••abcd`, com máscara de tamanho fixo e mascaramento total de segredos curtos.
- `@aom/database`:
  - Tabelas `users`, `organizations`, `organization_members`, `audit_logs`, `feature_flags` (migration `20260923214105_init`).
  - `createPrismaClient(url, { connectionLimit, allowPublicKeyRetrieval })`.
  - Redis: `createRedisClient`, `acquireLock`/`withLock` (token + Lua), `cacheGet/Set/Delete/GetOrSet`, `consumeRateLimit` (janela fixa atômica). Chaves sob `aom:`.
  - Seed idempotente: Super Admin (argon2id, credenciais do env validadas), Organização Demo (`slug=demo`, ADMIN), 4 feature flags desabilitadas.
- Scripts raiz: `pnpm validate` (format:check → build → lint → typecheck → test), `pnpm test:integration`, `pnpm db:generate|db:migrate:dev|db:migrate:deploy|db:migrate:status|db:seed`.
- `@aom/types` (PASSO 4): `API_ERROR_CODES`, `ApiErrorBody`, `Paginated<T>`. `@aom/database` (PASSO 4): `createPrismaAdapter`, `getPrismaErrorCode`/`PRISMA_ERROR_CODES`, `toRedisOptions`.
- **API (`apps/api`)**:
  - Config Zod validada no boot (`loadConfig`, vazio = padrão), injetada via `APP_CONFIG`.
  - Logs JSON (pino) com `service`, request id (`X-Request-Id`) e redaction de secrets.
  - Helmet, CORS por lista, body limit, timeout (408), rate limit global por IP com storage Redis (429 + Retry-After).
  - Validação Zod via `@Body/@Query/@Param({ schema })` + `StandardSchemaValidationPipe` global (400 `VALIDATION_ERROR`).
  - Erros no formato `ApiErrorBody` com `code` estável (P2002→409, P2025→404, 500 genérico).
  - Paginação: `paginationQuerySchema`, `toSkipTake`, `paginate`.
  - Health: `/health/live`, `/health/ready` (MySQL+Redis, 503 se cair), `/health` (+ versão, uptime, instâncias de worker/scheduler).
  - Filas BullMQ (9) com retry exponencial e retenção configuráveis; prefixo `aom-bull`.
  - Worker/scheduler com heartbeat `aom:heartbeat:<papel>:<hostname>` e `healthcheck.js`.
  - Módulo `feature-flags` (repository → service, cache Redis, desconhecida = false).
- Docker: `docker compose up -d` (tudo saudável), `docker compose run --rm tools pnpm validate`, `docker build --target validate .` (CI), `docker build --target api .` (produção: backend/worker/scheduler com a mesma imagem, usuário `node`).

## Decisões tomadas

- Seguir integralmente a especificação do `PROMPT.md`.
- Execução estritamente por passos, somente com autorização explícita (`INICIE O PASSO X`).
- Commits e pushes feitos **manualmente pelo usuário**; a IA apenas sugere a mensagem (Conventional Commits).
- ADR-001 a ADR-006 em `DOCUMENTACAO.md` §30 (pnpm workspaces; escopo `@aom`; worker/scheduler como entrypoints da api; build dual ESM/CJS dos pacotes; TypeScript 6.0; Vitest nos pacotes compartilhados).
- ADR-007 a ADR-010 (PASSO 2): Dockerfile único multi-stage; serviços de aplicação entram no compose junto com os apps (PASSOS 4/5); `node_modules` em volumes nomeados; MySQL 8.4 LTS + Redis 8 com AOF e `noeviction`.
- ADR-011 a ADR-016 (PASSO 3): pacote `@aom/database` somente servidor; Prisma 7.10 fixado + adapter mariadb; UUID v7 em `CHAR(36)`; SUPER_ADMIN como flag do usuário; schema incremental (tabelas no passo em que são usadas); testes de integração com MySQL/Redis reais.
- ADR-017 a ADR-024 (PASSO 4): NestJS 12 ESM (`~12.0.x`, respeitando `minimumReleaseAge`); SWC para build/dev/Jest; Jest em modo ESM com preload do Nest; Zod 4 via `StandardSchemaValidationPipe`; throttler com storage Redis; serviço `setup` + nodemon polling; heartbeat no Redis; erros com `code` estável.

## Padrões adotados

- Conventional Commits nas sugestões de commit.
- Constantes de domínio como arrays/objetos `as const` + tipo derivado (`(typeof X)[number]`), valores em MAIÚSCULAS.
- `no-console` proibido pelo lint (logs estruturados via logger da aplicação).
- `consistent-type-imports` obrigatório; variáveis/args não usados prefixados com `_`.
- Finais de linha LF (`.gitattributes` + `.editorconfig` + Prettier).
- Datas armazenadas em UTC (`TZ=UTC`), convertidas para o timezone da organização.
- Toda chamada de IA passa pelo `AIProviderManager` (nenhum SDK espalhado).
- Regras de negócio em services, nunca em controllers.
- Configurações operacionais não hardcoded.
- Validação via Docker: `docker build --target validate .` (limpa) e `docker compose run --rm tools pnpm validate` (código montado). O host não tem `node_modules`.
- Validação de compose em projeto isolado (`-p aom-validate --env-file .env.example`, removido com `down -v` ao final) para não criar volumes com senhas de exemplo no projeto real `aom`.
- Todo novo pacote/app do monorepo precisa de um volume `node_modules_<nome>` no serviço `tools` (e nos serviços de app).
- Schema: tabelas/colunas `snake_case` via `@@map`/`@map`, IDs `uuid(7)` `CHAR(36)`, `created_at`/`updated_at`, `deleted_at` nas entidades de negócio, enums espelhando `@aom/types` (com teste de paridade).
- Toda variável que o Prisma/testes precisam deve ser repassada explicitamente no `environment` do `tools` (Prisma 7 não lê `.env`).
- Testes: `*.test.ts` = unitário (sem infra, roda no CI/`validate`); `*.integration.test.ts` = integração (MySQL `_test` + Redis db 15).
- Chaves Redis da aplicação sempre via `redisKey(...)` (prefixo `aom:`); nunca usar `keyPrefix` do ioredis.
- Ordem de validação: build antes de lint (lint type-aware resolve pacotes pelo `dist/`).
- **API (ESM)**: imports relativos sempre com `.js`; classes injetadas com import de **valor** (nunca `import type`); tokens de injeção como `Symbol` (`APP_CONFIG`) com `@Inject`.
- **Camadas**: controller (HTTP + schema no decorator) → service (regras, cache, filas) → repository (único que injeta `PrismaService`, `select` explícito). Módulo exporta só o service.
- **Validação**: schemas Zod no decorator (`@Body({ schema })`), sem DTO/class-validator. Respostas diretas; listagens com `paginate()`.
- **Erros**: lançar `HttpException` do Nest (opcionalmente com `{ code, message, details }`); nunca montar resposta de erro manualmente.
- **Shutdown**: conexões fecham em `onApplicationShutdown`; limpezas que usam conexões ficam em `onModuleDestroy`.
- **Logs**: injetar `PinoLogger` (`setContext`); nunca logar payloads com secrets sem conferir o redaction.
- Testes da API: `src/**/*.spec.ts` (unitário, Jest) e `test/**/*.e2e-spec.ts` (integração, app real via `configureHttpApp`); libs CJS do ecossistema Nest que falharem no Jest ESM entram em `test/preload-esm.js`.
- Dependências novas: respeitar o `minimumReleaseAge` do pnpm (não manter `minimumReleaseAgeExclude`); scripts de instalação só com aprovação explícita em `allowBuilds`.

## Regras importantes

- Nunca publicar duas vezes por retry acidental (idempotência obrigatória).
- API Keys criptografadas, nunca retornadas completas ao frontend (usar `maskSecret`) e nunca registradas em logs.
- Alterações nas configurações de IA obrigatoriamente auditadas.
- Publicação automática somente onde a API oficial e os termos permitirem; caso contrário, fluxo assistido/manual.
- Proibido: spam, engajamento artificial, contas falsas, quebra de CAPTCHA, evasão de detecção e violação de termos.
- Métricas nunca inventadas.
- Sem TODO/FIXME ou mocks permanentes em funcionalidade do passo atual.
- Nomes de filas BullMQ não podem conter `:` (garantido por teste).
- Novas variáveis de ambiente entram no `.env.example` no mesmo passo em que passam a ser usadas.

## Integrações existentes

Nenhuma ainda.

## Configuração dos provedores de IA

Ainda não implementada. Contratos já definidos em `@aom/types` (`AI_PROVIDERS`, `DEFAULT_AI_PROVIDER_PRIORITY` = OPENAI → CLAUDE → GEMINI → OPENROUTER → OPENCODE, `CIRCUIT_STATES`). A prioridade real virá da configuração salva (PASSO 10).

## Status dos módulos

| Módulo                         | Status                                   |
| ------------------------------ | ---------------------------------------- |
| Tooling do monorepo            | Concluído                                |
| `@aom/config`                  | Concluído                                |
| `@aom/types`                   | Concluído                                |
| `@aom/shared`                  | Concluído                                |
| Docker (mysql, redis, tools)   | Concluído                                |
| `@aom/database`                | Concluído                                |
| API base / worker / scheduler  | Concluído (infraestrutura; sem domínios) |
| Módulo health                  | Concluído                                |
| Módulo feature-flags (leitura) | Concluído (gestão no PASSO 9)            |
| web (frontend)                 | Não iniciado (PASSO 5)                   |

## Limitações conhecidas

- **TypeScript fixado em `~6.0`**: o TS 7 (nativo) é o `latest`, mas o typescript-eslint 8 exige `<6.1` e o tsup depende da API JS do compilador. Reavaliar quando o ecossistema suportar TS 7.
- **`ignoreDeprecations: "6.0"`** em `packages/config/tsconfig/library.json`: o tsup injeta `baseUrl` (depreciado no TS 6) ao gerar `.d.ts`. O projeto não usa opções depreciadas; remover ao migrar o bundler (ex.: tsdown) ou quando o tsup corrigir.
- Os pacotes `@aom/*` precisam de `pnpm build` antes de serem consumidos por apps (exports apontam para `dist/`); o serviço `setup` faz isso a cada `up`. Alterações em `packages/*` com o ambiente no ar exigem rebuild do pacote (`docker compose run --rm tools pnpm --filter <pacote> build`) e restart do serviço.
- Redis sem senha em desenvolvimento (porta só em `127.0.0.1`); autenticação no hardening (PASSO 37).
- Em Docker Desktop no Windows, eventos de arquivo do host não chegam ao container: hot reload usa polling (nodemon `--legacy-watch`), com algum custo de CPU.
- **Imagem `api` de produção com ~770 MB**: o `@prisma/client` declara o CLI `prisma` como peer, e o `pnpm deploy --prod` inclui o CLI (Studio, PGlite, Effect, TypeScript). Funcional; redução planejada (PASSOS 36/40).
- Execução de migrations em produção ainda não definida (PASSO 40).
- Jest em modo ESM é experimental (`--experimental-vm-modules`); libs CJS que fazem `require` do Nest ESM exigem o preload (`test/preload-esm.js`).
- Worker e scheduler ainda não têm processadores/jobs (chegam com os domínios; scheduler no PASSO 23).
- Aviso inofensivo no `docker build` (instalação offline): `unrs-resolver postinstall: Failed to find package @unrs/resolver-binding-linux-x64-musl`.
- As variáveis `MYSQL_*` e o init script (`_test`/`_shadow`) só valem na primeira inicialização do volume `mysql_data`.
- **Prisma fixado em 7.10.0** (CLI, client e adapter na mesma versão; a tag `latest` do CLI aponta para uma RC 8.0). Atualizar os três juntos.
- `DATABASE_URL` repete usuário/senha de `MYSQL_*` (precisam ser mantidos em sincronia manualmente no `.env`).
- `allowPublicKeyRetrieval` habilitado só em desenvolvimento; produção exigirá TLS no MySQL (PASSO 37/40).
- Collation das tabelas: o Prisma impõe `utf8mb4_unicode_ci` por tabela (servidor usa `utf8mb4_0900_ai_ci`); ambas case-insensitive.
- E-mail único mesmo com soft delete: usuário removido logicamente bloqueia o e-mail até tratamento no PASSO 6 (ex.: anonimizar ao remover).
- O seed não sobrescreve a senha de um Super Admin já existente (trocar senha é fluxo do PASSO 6).

## Último passo concluído

**PASSO 4 — Backend base e padrões arquiteturais** (2026-09-23).

## Próximo passo

**PASSO 5 — Frontend base e Design System** (aguardando autorização: `INICIE O PASSO 5`).

## Pendências

- O usuário precisa criar o `.env` (`cp .env.example .env`, senhas reais, `SEED_SUPER_ADMIN_PASSWORD` com ≥ 12 caracteres) antes do primeiro `docker compose up -d`; depois `docker compose run --rm tools pnpm db:seed` (as migrations o `setup` já aplica).
- PASSO 5: adicionar volume `node_modules_web` e serviço `frontend` (polling) no compose; target de produção do web no `Dockerfile`.
- PASSOS 36/40: reduzir a imagem `api`; migrations em produção.

## Bugs conhecidos

Nenhum.

## Decisões que NÃO devem ser revertidas

- Failover entre provedores de IA gerenciado pelo `AIProviderManager` da aplicação (mesmo que o OpenRouter tenha fallback próprio).
- Stack obrigatória: React + NestJS + MySQL/Prisma + Redis/BullMQ + Docker.
- Execução por passos com parada obrigatória e commits manuais.
- Worker e scheduler compartilham a base de código de `apps/api` (ADR-003) — não criar `apps/worker` duplicando módulos de domínio.
- Redis com `maxmemory-policy noeviction` (exigência do BullMQ) — nunca trocar para uma política com eviction.
- Datas e servidores em UTC (MySQL `default-time-zone=+00:00`, `TZ=UTC` nos containers).
- Testes de integração nunca rodam contra o banco de desenvolvimento (guarda em `integration-setup.ts` e `apps/api/test/global-setup.js`).
- NestJS 12 é ESM-only: a API permanece ESM (não converter para CJS).
- Rate limit com storage compartilhado no Redis (não voltar ao storage em memória).
- Contrato de erro `ApiErrorBody` com `code` estável (o frontend depende dele para i18n).
- Health checks fora do prefixo `/api/v1` e do rate limit (usados por Docker/orquestradores).
- Migrations já commitadas nunca são editadas; alterações de schema geram nova migration.
- Senhas somente com argon2id; credenciais de seed apenas via variáveis de ambiente.

---

## Histórico

- 2026-09-23 — Criados `DOCUMENTACAO.md`, `CONTEXTO.md` e `PASSOS.md` a pedido do usuário, antes do PASSO 1.
- 2026-09-23 — **PASSO 1 concluído**: monorepo pnpm, tooling (TS/ESLint/Prettier), pacotes `@aom/config`, `@aom/types`, `@aom/shared`, `.env.example`, `README.md`, ADRs. Erros encontrados e corrigidos: (1) pnpm 12 não reconhece mais `onlyBuiltDependencies` → substituído por `allowBuilds` via `pnpm approve-builds esbuild`; (2) TS 7 incompatível com typescript-eslint/tsup → fixado TS `~6.0`; (3) tsup falhava no `.d.ts` por `baseUrl` depreciado → `ignoreDeprecations: "6.0"` no tsconfig de bibliotecas.
- 2026-09-23 — **PASSO 2 concluído**: `docker-compose.yml` (mysql 8.4, redis 8, tools), `Dockerfile` multi-stage (base/dev/build/validate), `.dockerignore`, portas do host no `.env.example`. Validado: compose falha sem `.env`; mysql e redis saudáveis; utf8mb4 + UTC confirmados; `noeviction` + AOF confirmados; dados persistem após restart; `pnpm validate` passa via `tools` e via `docker build --target validate`. Erro corrigido: `pnpm fetch --frozen-lockfile` não existe no pnpm 12 → flag removida. Porta 6379 do host ocupada por outro projeto → padrões 3307/6380. Serviços de app movidos para os PASSOS 4/5 (ADR-008).
- 2026-09-23 — **PASSO 3 concluído**: pacote `@aom/database` (Prisma 7.10 + adapter mariadb, schema com 5 tabelas, migration `init`, seed idempotente, utilitários Redis), bancos `_test`/`_shadow` via init script, `ORGANIZATION_ROLES`/`FEATURE_FLAGS` em `@aom/types`. Validado: 36 testes unitários + 19 de integração (MySQL/Redis reais), seed recusa senha de exemplo e é idempotente, dist CJS/ESM consumível (consulta real), `docker build --target validate` sem banco. Erros corrigidos: (1) tag `latest` do `prisma` aponta para RC → versões fixadas em 7.10.0; (2) pnpm bloqueou scripts do Prisma → `approve-builds prisma @prisma/engines`; (3) checagem de senha de exemplo nunca executava (placeholders < 12 caracteres) → regra por padrão `change-?me`; (4) lint falhava por rodar antes do build (dist desatualizado) → `validate` agora faz build antes do lint. Roadmap: Role/Permission → PASSO 7, SystemSetting → PASSO 9, Marca Demo → PASSO 8, Campanha Demo → PASSO 21 (ADR-015).
- 2026-09-23 — **PASSO 4 concluído**: `apps/api` (NestJS 12 ESM) com config Zod, logs pino com redaction/request id, helmet, CORS, rate limit Redis, filter/pipe/interceptor globais, health checks, paginação, filas BullMQ, worker/scheduler com heartbeat, módulo feature-flags; Dockerfile `api` (produção) e compose com `setup`/`backend`/`worker`/`scheduler`. Validado: 21 unitários + 21 de integração da API, `pnpm validate`, integração de todo o monorepo, `docker compose up --wait` com tudo saudável (40 s), hot reload no Windows, imagem de produção nos 3 papéis (não root, heartbeat, shutdown gracioso). Erros encontrados e corrigidos: (1) consulta travada no `corepack` (rede transitória) → imagem `tools` usada para consultas; (2) Nest 12 é ESM-only → API ESM; (3) Nest 12.1.0 publicado no mesmo dia violava `minimumReleaseAge` (pnpm adicionou exceções) → `~12.0.x` e exceções removidas; (4) scripts de build novos → aprovados `@swc/core`/`unrs-resolver`, negados `@parcel/watcher`/`msgpackr-extract`; (5) `Prisma.PrismaClientKnownRequestError` ausente nos tipos empacotados → `getPrismaErrorCode`; (6) tipos do BullMQ × ioredis 6 → `RedisConnectionOptions`; (7) Jest ESM: `require(esm) in a cycle` com nestjs-pino → `test/preload-esm.js`; (8) heartbeat não era removido no shutdown (Redis fechado antes) → conexões fecham em `onApplicationShutdown`, limpeza em `onModuleDestroy`; (9) erros do body-parser (413/400) viravam 500 → tratados no filter; (10) variáveis vazias do compose quebrariam a config → vazio = padrão; (11) banner de update do Prisma sugerindo RC → `PRISMA_HIDE_UPDATE_MESSAGE`. Limitação registrada: imagem `api` ~770 MB (CLI do Prisma via peer).
