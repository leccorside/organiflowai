# DOCUMENTACAO.md — Documentação Técnica

> Documentação técnica principal do projeto **AI Organic Marketing Automation**.
> Deve ser atualizada a cada alteração relevante; código e documentação não podem ficar inconsistentes.
>
> **Status atual:** PASSO 3 concluído — monorepo, tooling, pacotes compartilhados, infraestrutura Docker e camada de dados (`@aom/database`: Prisma/MySQL com migration inicial e seed, utilitários Redis). Itens marcados como _(planejado)_ ainda não existem.

---

## Sumário

1. [Descrição do projeto](#1-descrição-do-projeto)
2. [Objetivos](#2-objetivos)
3. [Arquitetura](#3-arquitetura)
4. [Stack](#4-stack)
5. [Estrutura de diretórios](#5-estrutura-de-diretórios)
6. [Frontend](#6-frontend)
7. [Backend](#7-backend)
8. [Banco de dados](#8-banco-de-dados)
9. [Redis](#9-redis)
10. [Filas](#10-filas)
11. [Docker](#11-docker)
12. [Serviços](#12-serviços)
13. [Módulos e pacotes](#13-módulos-e-pacotes)
14. [Autenticação](#14-autenticação)
15. [Autorização e RBAC](#15-autorização-e-rbac)
16. [APIs e endpoints](#16-apis-e-endpoints)
17. [WebSockets](#17-websockets)
18. [Jobs, workers, cron jobs e scheduler](#18-jobs-workers-cron-jobs-e-scheduler)
19. [Integrações externas](#19-integrações-externas)
20. [Provedores de IA e sistema de fallback](#20-provedores-de-ia-e-sistema-de-fallback)
21. [Segurança](#21-segurança)
22. [Variáveis de ambiente](#22-variáveis-de-ambiente)
23. [Migrations](#23-migrations)
24. [Testes e qualidade](#24-testes-e-qualidade)
25. [Observabilidade e logs](#25-observabilidade-e-logs)
26. [Tratamento de erros](#26-tratamento-de-erros)
27. [Deploy](#27-deploy)
28. [Backup e restauração](#28-backup-e-restauração)
29. [Troubleshooting](#29-troubleshooting)
30. [Decisões arquiteturais importantes](#30-decisões-arquiteturais-importantes)

---

## 1. Descrição do projeto

Plataforma de **automação de marketing orgânico com IA**. Centraliza estratégia, criação, geração com IA (vários provedores com failover), campanhas, calendário editorial, publicação, automações, SEO, analytics, aprendizagem contínua, administração e monitoramento, sem depender de anúncios pagos.

## 2. Objetivos

- Gerar estratégia de conteúdo a partir do perfil da marca (empresa, público, tom de voz, produtos, concorrentes, palavras-chave, objetivos).
- Gerar e adaptar conteúdo por canal (Instagram, LinkedIn, Facebook, X, TikTok, YouTube, Blog, Google Business Profile).
- Agendar e publicar via APIs oficiais permitidas; fluxo assistido quando não houver API.
- Coletar métricas reais e usá-las para melhorar as próximas gerações (feedback loop).
- Garantir resiliência de IA com prioridade configurável, failover e circuit breaker.

## 3. Arquitetura

**Modular Monolith** em NestJS, com boundaries claros por módulo de domínio para permitir futura extração em microsserviços. O mesmo código de `apps/api` é executado em três processos/containers distintos (ADR-003):

| Processo    | Entrypoint (planejado)  | Responsabilidade                                     |
| ----------- | ----------------------- | ---------------------------------------------------- |
| `backend`   | `src/main.ts`           | API REST, WebSocket/SSE, health checks               |
| `worker`    | `src/main.worker.ts`    | Consumo das filas BullMQ (sem servidor HTTP público) |
| `scheduler` | `src/main.scheduler.ts` | Enfileiramento de conteúdos programados e cron jobs  |

```text
[web (React)] ──HTTP/WS──> [backend] ──> [MySQL]
                               │  └────> [Redis] <── [worker]    (apps/api, entrypoint worker)
                               │                 <── [scheduler] (apps/api, entrypoint scheduler)
                               └──> AIProviderManager ──> OpenAI | Claude | Gemini | OpenRouter | OpenCode
```

Pacotes em `packages/*`:

- **Universais** (`@aom/types`, `@aom/shared`): código **puro e agnóstico de runtime** (sem NestJS, sem React, sem I/O), consumidos pelo backend e pelo frontend.
- **Somente servidor** (`@aom/database`): Prisma, MySQL e Redis. Consumido por `backend`, `worker` e `scheduler`; **nunca** importado pelo frontend (ADR-011).

## 4. Stack

| Camada           | Tecnologia                                                                                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime          | Node.js 24 (`.nvmrc`), pnpm 12.6 (fixado em `package.json` → `packageManager`, via corepack)                                                                  |
| Linguagem        | TypeScript 6.0                                                                                                                                                |
| Qualidade        | ESLint 10 (flat config, typescript-eslint 8 type-aware), Prettier 3                                                                                           |
| Pacotes internos | tsup 8 (ESM + CJS + `.d.ts`), Vitest 5                                                                                                                        |
| Frontend         | React, TypeScript, Vite, React Router, TanStack Query, Zustand, React Hook Form, Zod, Tailwind CSS, biblioteca de componentes acessíveis, gráficos, PWA-ready |
| Backend          | NestJS, REST, WebSocket/SSE                                                                                                                                   |
| Banco            | MySQL 8.4 LTS, Prisma 7.10 (`prisma-client` generator, Query Compiler, adapter `@prisma/adapter-mariadb`)                                                     |
| Cache / filas    | Redis 8, ioredis 6, BullMQ (PASSO 23)                                                                                                                         |
| Senhas           | argon2id (`@node-rs/argon2`)                                                                                                                                  |
| Infra            | Docker, docker compose, nginx (opcional)                                                                                                                      |
| Testes           | Jest (backend), Vitest + React Testing Library (frontend e pacotes), Playwright (E2E)                                                                         |

## 5. Estrutura de diretórios

```text
.
├── apps/                        # (planejado) api — PASSO 4 · web — PASSO 5
├── packages/
│   ├── config/                  # @aom/config
│   │   └── tsconfig/
│   │       ├── base.json        # strict, ES2023, moduleResolution Bundler
│   │       └── library.json     # base + declaration (pacotes compartilhados)
│   ├── types/                   # @aom/types — contratos de domínio
│   │   └── src/ (ai, channels, content, feature-flags, queues, roles, index)
│   ├── shared/                  # @aom/shared — utilitários puros
│   │   └── src/ (secrets, index)
│   └── database/                # @aom/database — camada de dados (somente servidor)
│       ├── prisma.config.ts     # schema, migrations, seed e URLs (Prisma 7)
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── migrations/      # versionadas no git
│       └── src/
│           ├── prisma.ts        # createPrismaClient / toPoolConfig
│           ├── redis/           # connection, lock, cache, rate-limit
│           ├── seed/            # config (validação), seed (idempotente), run (CLI)
│           ├── test/            # setup e helpers dos testes de integração
│           └── generated/       # Prisma Client gerado (ignorado pelo git)
├── docker/
│   └── mysql/initdb/            # scripts da 1ª inicialização do MySQL (bancos _test e _shadow)
├── eslint.config.mjs            # ESLint único para todo o monorepo
├── package.json                 # scripts raiz e ferramentas de qualidade
├── pnpm-workspace.yaml          # workspaces (apps/*, packages/*) + allowBuilds
├── pnpm-lock.yaml
├── Dockerfile                   # multi-stage do monorepo (base, dev, build, validate)
├── docker-compose.yml           # mysql, redis, tools
├── .dockerignore
├── .env.example · .editorconfig · .gitattributes · .gitignore · .nvmrc
├── .prettierrc.json · .prettierignore
├── README.md · DOCUMENTACAO.md · CONTEXTO.md · PASSOS.md · PROMPT.md
```

Estrutura planejada do backend (`apps/api/src`): `modules/` (auth, users, organizations, brands, campaigns, contents, publications, automations, integrations, ai, analytics, notifications, audit), `common/`, `config/`, `database/`, `queues/`.

## 6. Frontend

_(planejado — PASSO 5)_ Arquitetura por features/domínios; sidebar, topbar, breadcrumbs, command palette, atalhos, skeleton loading, empty states, toast, modal, drawer, tabelas avançadas, filtros, busca global; tema Light/Dark/System; responsivo; i18n pt/en/es. Consumirá `@aom/types` e `@aom/shared` via entrada ESM.

## 7. Backend

_(planejado — PASSO 4)_ Módulos NestJS com controllers finos, services com regras de negócio, repositories para acesso a dados, DTOs validados, guards, interceptors e filters globais. Consumirá `@aom/types` e `@aom/shared` via entrada CJS (ou ESM, conforme configuração do PASSO 4).

## 8. Banco de dados

MySQL 8.4 + Prisma 7.10, no pacote `@aom/database` (schema em `packages/database/prisma/schema.prisma`).

### Conexão

- Runtime: `createPrismaClient(databaseUrl, options)` usa o driver adapter `@prisma/adapter-mariadb` (o Prisma 7 não tem mais engine Rust de consulta). A URL `mysql://usuario:senha@host:porta/banco` é convertida em configuração de pool por `toPoolConfig` (usuário/senha decodificados; senha nunca aparece em mensagens de erro).
- `allowPublicKeyRetrieval`: o MySQL 8.4 autentica com `caching_sha2_password`; sem TLS, o driver precisa obter a chave pública do servidor. Habilitado apenas em desenvolvimento (`DATABASE_ALLOW_PUBLIC_KEY_RETRIEVAL=true`, rede interna Docker). Em produção: TLS (PASSO 37/40). Padrão da função: `false`.
- CLI (migrate/seed): lê `DATABASE_URL`/`SHADOW_DATABASE_URL` em `prisma.config.ts`. O Prisma 7 **não carrega `.env` sozinho** — as variáveis chegam pelo ambiente do container (`tools` as repassa explicitamente).

### Convenções do schema

| Convenção   | Regra                                                                                                                        |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------- |
| IDs         | `CHAR(36)` com **UUID v7** (`@default(uuid(7))`): ordenado no tempo → inserções sequenciais no índice clusterizado do InnoDB |
| Nomes       | Tabelas e colunas em `snake_case` (`@@map`/`@map`); modelos/campos em PascalCase/camelCase no código                         |
| Datas       | `DATETIME(3)` em UTC (`created_at`, `updated_at`)                                                                            |
| Soft delete | `deleted_at` (indexado) nas entidades de negócio; consultas devem filtrar `deletedAt: null`                                  |
| Charset     | `utf8mb4`; o Prisma define `utf8mb4_unicode_ci` por tabela (case-insensitive: `UNIQUE` de e-mail não diferencia maiúsculas)  |
| Enums       | Espelham `@aom/types` — paridade verificada por teste (`src/enums.test.ts`)                                                  |

### Tabelas (migration `init`)

| Tabela                 | Finalidade                    | Chaves / índices / regras                                                                                                                                              |
| ---------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `users`                | Usuários da plataforma        | `email` único; `password_hash` (argon2id); `is_super_admin` (papel SUPER_ADMIN é da plataforma); `deleted_at` indexado                                                 |
| `organizations`        | Tenants                       | `slug` único; `timezone` IANA (padrão `UTC`); `locale` (padrão `pt-BR`); `deleted_at` indexado                                                                         |
| `organization_members` | Vínculo usuário × organização | `role` ENUM(ADMIN, MANAGER, EDITOR, VIEWER), padrão VIEWER; único (`organization_id`, `user_id`); FKs `ON DELETE CASCADE`                                              |
| `audit_logs`           | Auditoria append-only         | `before`/`after` JSON, `ip`, `user_agent`, `request_id`; FKs `ON DELETE SET NULL` (log sobrevive à remoção do ator); índices por organização/ator + data e por recurso |
| `feature_flags`        | Flags globais                 | PK `key` (valores de `FEATURE_FLAGS`)                                                                                                                                  |

Entidades previstas nos próximos passos: Role/Permission (PASSO 7), Brand/BrandMemory (8), SystemSetting (9), AIProvider (10), PromptTemplate (18), Content (19), Campaign (21), Publication/Channel/SocialAccount (24), Automation (25), Analytics (26).

## 9. Redis

Container disponível desde o PASSO 2 (ver §11): Redis 8, persistência AOF (`appendonly yes`) e `maxmemory-policy noeviction` — obrigatório para o BullMQ (o Redis nunca pode descartar chaves de jobs).

Utilitários em `@aom/database` (ioredis 6), todos com chaves sob o prefixo `aom:` (`redisKey(...)`). A opção `keyPrefix` do ioredis **não** é usada, pois é incompatível com o BullMQ.

| Utilitário                                                | Chave                 | Comportamento                                                                                                                                                                        |
| --------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `createRedisClient(url, options?)`                        | —                     | Conexão de uso geral (`maxRetriesPerRequest: 3`). Conexões de workers BullMQ precisarão de `maxRetriesPerRequest: null`                                                              |
| `acquireLock(redis, resource, ttlMs)`                     | `aom:lock:<resource>` | `SET NX PX` com token aleatório; `release()`/`extend()` atômicos via Lua, só atuam se o token ainda for o dono (não libera lock expirado e readquirido por outro). `null` se ocupado |
| `withLock(redis, resource, ttlMs, fn)`                    | idem                  | Executa `fn` com o lock e sempre libera ao final; `LockNotAcquiredError` se ocupado. Base da idempotência de publicações/jobs                                                        |
| `cacheGet` / `cacheSet` / `cacheDelete` / `cacheGetOrSet` | `aom:cache:<key>`     | JSON com TTL obrigatório (segundos)                                                                                                                                                  |
| `consumeRateLimit(redis, key, limit, windowMs)`           | `aom:ratelimit:<key>` | Janela fixa atômica (`INCR` + `PEXPIRE` em Lua). Retorna `allowed`, `remaining`, `resetInMs`                                                                                         |

Databases lógicos: `0` (aplicação, `REDIS_URL`) e `15` (testes de integração, `TEST_REDIS_URL`, esvaziado a cada teste).

_(planejado)_ Sessões (PASSO 6), filas/scheduler (PASSO 23), estado do circuit breaker (PASSO 16), health checks de IA (PASSO 17).

## 10. Filas

_(planejado — PASSO 23)_ Nomes já definidos em `@aom/types` → `QUEUE_NAMES` (o valor é o nome real no Redis; sem `:`, exigência do BullMQ, garantida por teste):

`AI_GENERATION`, `CONTENT_PROCESSING`, `CONTENT_PUBLICATION`, `CONTENT_SCHEDULING`, `ANALYTICS_COLLECTION`, `AI_HEALTH_CHECK`, `NOTIFICATIONS`, `SEO_ANALYSIS`, `WEBHOOK_PROCESSING`.

Políticas: retry, backoff exponencial, dead letter, idempotência, timeout e controle de concorrência.

## 11. Docker

O projeto roda via `docker compose up -d` (nome do projeto Compose: `aom`). Comandos do dia a dia no `README.md`.

### `docker-compose.yml`

| Serviço | Imagem / build       | Porta no host                             | Healthcheck                              | Volume(s)                                           |
| ------- | -------------------- | ----------------------------------------- | ---------------------------------------- | --------------------------------------------------- |
| `mysql` | `mysql:8.4` (LTS)    | `127.0.0.1:${MYSQL_HOST_PORT:-3307}→3306` | `mysqladmin ping -h 127.0.0.1` (via TCP) | `mysql_data`                                        |
| `redis` | `redis:8-alpine`     | `127.0.0.1:${REDIS_HOST_PORT:-6380}→6379` | `redis-cli ping`                         | `redis_data`                                        |
| `tools` | `Dockerfile` → `dev` | —                                         | —                                        | bind `.` + `pnpm_store` + volumes de `node_modules` |

- **MySQL**: `utf8mb4` / `utf8mb4_0900_ai_ci`, `default-time-zone=+00:00` e `TZ=UTC`. As variáveis `MYSQL_*` são **obrigatórias** (`${VAR:?mensagem}`): sem `.env`, o Compose falha com mensagem explícita em vez de subir com senha vazia. O healthcheck usa `-h 127.0.0.1` para forçar TCP: o servidor temporário do entrypoint roda sem rede, então o container só fica saudável após o fim da inicialização.
- **Bancos auxiliares**: `docker/mysql/initdb/01-extra-databases.sh` (montado em `/docker-entrypoint-initdb.d`) cria `<MYSQL_DATABASE>_test` (testes de integração) e `<MYSQL_DATABASE>_shadow` (shadow database do `prisma migrate dev`) com privilégios apenas para `MYSQL_USER`. Roda **somente na primeira inicialização do volume**.
- **Variáveis no `tools`**: repassadas explicitamente do `.env` (`DATABASE_URL`, `SHADOW_DATABASE_URL`, `TEST_DATABASE_URL`, `DATABASE_ALLOW_PUBLIC_KEY_RETRIEVAL`, `REDIS_URL`, `TEST_REDIS_URL`, `SEED_*`).
- **Redis**: `--appendonly yes` e `--maxmemory-policy noeviction` (exigência do BullMQ). Sem senha em desenvolvimento (porta só em `127.0.0.1`); autenticação será tratada no hardening (PASSO 37).
- **Portas** publicadas apenas em `127.0.0.1` (não expostas na rede local). Os padrões 3307/6380 evitam conflito com instalações/containers já usando 3306/6379.
- **`tools`** (perfil `tools`, não sobe no `up -d`): executa pnpm, lint, testes e build sem Node no host. O código é montado por bind mount; os `node_modules` ficam em **volumes nomeados** (Linux), evitando binários nativos incompatíveis com o host e a lentidão de I/O de bind mounts no Windows/macOS. Cada novo pacote/app do monorepo precisa de um volume `node_modules_<nome>` correspondente.

### `Dockerfile` (multi-stage, único para o monorepo)

| Target     | Conteúdo                                                                                                    | Uso                                      |
| ---------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `base`     | `node:24-alpine`, `TZ=UTC`, corepack + pnpm na versão exata de `packageManager`, store em `/pnpm/store`     | Base de todos os targets                 |
| `dev`      | `base` sem código (montado em runtime)                                                                      | Serviço `tools`                          |
| `build`    | `pnpm fetch` (camada dependente só do lockfile) → cópia do código → `pnpm install --offline` → `pnpm build` | Base das imagens dos apps (PASSOS 4 e 5) |
| `validate` | `build` + `format:check`, `lint`, `typecheck`, `test`                                                       | CI: `docker build --target validate .`   |

O store do pnpm usa cache do BuildKit (`--mount=type=cache,id=aom-pnpm-store`), acelerando rebuilds.

### Serviços planejados

- **PASSO 4**: `backend`, `worker` e `scheduler` — mesma imagem de `apps/api` (target próprio no `Dockerfile`), comandos diferentes (ADR-003).
- **PASSO 5**: `frontend` (Vite em dev).
- **Hot reload** (PASSOS 4/5): em Docker Desktop no Windows, eventos de arquivo do host não chegam ao container via bind mount; os watchers (Nest/Vite) deverão usar polling em desenvolvimento.
- **nginx**: não é necessário em desenvolvimento (cada serviço expõe sua porta). Será avaliado na preparação para produção (PASSO 40) como reverse proxy/TLS.

## 12. Serviços

| Serviço                              | Status                           |
| ------------------------------------ | -------------------------------- |
| `mysql`                              | Disponível (`docker compose up`) |
| `redis`                              | Disponível (`docker compose up`) |
| `tools`                              | Disponível (sob demanda)         |
| Aplicação (api/worker/scheduler/web) | Planejado (PASSOS 4 e 5)         |

## 13. Módulos e pacotes

### `@aom/config`

Configurações TypeScript compartilhadas, exportadas como `@aom/config/tsconfig/*`:

- `base.json`: `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, `isolatedModules`, ES2023, `moduleResolution: Bundler`.
- `library.json`: base + `declaration`, `noEmit` (o emit é feito pelo tsup) e `ignoreDeprecations: "6.0"` (ver §29).

### `@aom/types`

Contratos de domínio compartilhados (constantes `as const` + tipos derivados):

| Export                         | Valores                                                                                       |
| ------------------------------ | --------------------------------------------------------------------------------------------- |
| `ROLES` / `Role`               | SUPER_ADMIN, ADMIN, MANAGER, EDITOR, VIEWER                                                   |
| `CONTENT_STATUSES`             | IDEA, DRAFT, GENERATING, REVIEW, APPROVED, SCHEDULED, PUBLISHING, PUBLISHED, FAILED, CANCELED |
| `AUTONOMY_MODES`               | MANUAL, ASSISTED, AUTOMATIC                                                                   |
| `CHANNEL_TYPES`                | INSTAGRAM, FACEBOOK, LINKEDIN, X, TIKTOK, YOUTUBE, BLOG, GOOGLE_BUSINESS, TELEGRAM            |
| `AI_PROVIDERS`                 | OPENAI, CLAUDE, GEMINI, OPENROUTER, OPENCODE                                                  |
| `DEFAULT_AI_PROVIDER_PRIORITY` | Ordem inicial (usada só no seed): OPENAI → CLAUDE → GEMINI → OPENROUTER → OPENCODE            |
| `CIRCUIT_STATES`               | CLOSED, OPEN, HALF_OPEN                                                                       |
| `QUEUE_NAMES` / `QueueName`    | As 9 filas da §10                                                                             |
| `ORGANIZATION_ROLES`           | ADMIN, MANAGER, EDITOR, VIEWER (papéis por organização; espelhado no enum do Prisma)          |
| `FEATURE_FLAGS`                | ENABLE_AUTOPUBLISH, ENABLE_AI_ROUTING, ENABLE_TRENDS, ENABLE_COMPETITOR_ANALYSIS              |

### `@aom/shared`

| Export                         | Descrição                                                                                                                                                                                    |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `maskSecret(secret, options?)` | Mascara segredos para exibição (`••••••••••abcd`). Máscara de tamanho fixo (não revela o comprimento), mostra só os 4 últimos caracteres e mascara totalmente segredos com até 8 caracteres. |
| `SECRET_MASK_CHAR`             | Caractere da máscara (`•`).                                                                                                                                                                  |

### `@aom/database` (somente servidor)

Exporta o Prisma Client gerado (`PrismaClient`, `Prisma`, tipos dos modelos, enums), `createPrismaClient`/`toPoolConfig` (§8) e os utilitários Redis (§9). O seed **não** é exportado (uso só em desenvolvimento).

| Script               | O que faz                                                               |
| -------------------- | ----------------------------------------------------------------------- |
| `build`              | `prisma generate` + tsup (ESM/CJS com `--shims` para `import.meta.url`) |
| `typecheck` / `test` | `prisma generate` + tsc / Vitest unitário (sem MySQL/Redis)             |
| `test:integration`   | `prisma generate` + Vitest de integração (MySQL e Redis reais, ver §24) |
| `db:generate`        | Gera o client em `src/generated/prisma` (ignorado pelo git)             |
| `db:migrate:dev`     | Cria/aplica migrations em desenvolvimento (usa o shadow database)       |
| `db:migrate:deploy`  | Aplica migrations pendentes (produção/CI)                               |
| `db:migrate:status`  | Estado das migrations                                                   |
| `db:seed`            | Executa o seed (`prisma db seed` → `tsx src/seed/run.ts`)               |

Todos também disponíveis na raiz (`pnpm db:*`, `pnpm test:integration`).

**Build dos pacotes**: `tsup src/index.ts --format esm,cjs --dts --clean` → `dist/index.js` (ESM), `dist/index.cjs` (CJS), `dist/index.d.ts` / `dist/index.d.cts`. O `exports` do `package.json` resolve `import` e `require` para o formato correto.

## 14. Autenticação

_(planejado — PASSO 6)_ Registro, login, logout, JWT (access + refresh com rotação), sessões, revogação, confirmação de e-mail, recuperação/alteração de senha, proteção contra brute force, arquitetura pronta para MFA.

## 15. Autorização e RBAC

_(planejado — PASSO 7)_ Perfis de `@aom/types` → `ROLES` com permissões granulares (ex.: `campaign.create`, `content.approve`, `content.publish`, `ai.configure`, `integration.configure`, `analytics.read`), escopo por organização.

## 16. APIs e endpoints

Nenhum implementado. Planejados desde o PASSO 4: `GET /health`, `GET /health/live`, `GET /health/ready`.

## 17. WebSockets

_(planejado)_ WebSocket/SSE para atualizações em tempo real (status de geração, publicações, notificações in-app).

## 18. Jobs, workers, cron jobs e scheduler

_(planejado — PASSO 23)_ O processo `worker` consome as filas BullMQ; o processo `scheduler` enfileira conteúdos programados respeitando o timezone da organização (datas em UTC). Locks distribuídos impedem execução/publicação duplicada. Ambos são entrypoints de `apps/api` (ADR-003).

## 19. Integrações externas

_(planejado — PASSO 24)_ `PublisherAdapter` com implementações (Instagram, Facebook, LinkedIn, X, YouTube, WordPress, Google Business, Telegram) **somente onde a API oficial e os termos permitirem**. Caso contrário: gerar, deixar pronto, copiar, exportar e notificar.

## 20. Provedores de IA e sistema de fallback

_(planejado — PASSOS 10 a 17)_

- `AIProviderAdapter` (interface) com `OpenAIProvider`, `ClaudeProvider`, `GeminiProvider`, `OpenRouterProvider`, `OpenCodeProvider`. Identificadores já definidos em `@aom/types` → `AI_PROVIDERS`.
- `AIProviderManager` como único ponto de entrada para chamadas de IA.
- Prioridade configurável por drag-and-drop, aplicada sem reiniciar a aplicação.
- Failover em: timeout, HTTP 429/500/502/503/504, erro de conexão/DNS, serviço/modelo indisponível, rate limit, quota excedida. Erros permanentes de configuração tratados separadamente.
- Circuit Breaker `CLOSED → OPEN → HALF_OPEN` com valores configuráveis.
- API Keys exibidas com `maskSecret` (`@aom/shared`).
- Registro por requisição: provider, model, taskType, tokens, custo estimado, latência, status, errorCode, fallbackCount.

## 21. Segurança

Já aplicado:

- `.env` e variantes ignorados pelo git (`.gitignore`), exceto `.env.example`.
- Lint proíbe `console` (evita vazamento acidental de dados em logs não estruturados).
- `maskSecret` pronto para exibição segura de API Keys.
- pnpm só executa scripts de instalação de dependências explicitamente aprovadas (`allowBuilds`: apenas `esbuild`) e valida o lockfile contra as políticas de supply chain.
- Docker: portas de MySQL/Redis publicadas só em `127.0.0.1`; `.env` fora do contexto de build (`.dockerignore`); variáveis de senha do MySQL obrigatórias, sem valores padrão.
- Senhas com **argon2id** (`@node-rs/argon2`; o hash inclui algoritmo e parâmetros).
- Seed recusa credenciais fracas/de exemplo (mínimo 12 caracteres, sem `change-me`) e nunca inclui a senha em logs ou mensagens de erro.
- Menor privilégio no MySQL: o usuário da aplicação só acessa `aom`, `aom_test` e `aom_shadow`.
- Consultas via Prisma são parametrizadas (proteção contra SQL injection); `$queryRaw` só com template tagged.
- Scripts de instalação aprovados explicitamente: `esbuild`, `prisma`, `@prisma/engines` (este baixa o binário do schema engine).

_(planejado)_ Helmet, CORS restritivo, rate limiting HTTP, validação, sanitização, CSRF quando aplicável, criptografia das chaves, logs sem secrets, TLS no banco em produção, proteção SSRF, validação de webhooks.

## 22. Variáveis de ambiente

Definidas em `.env.example` (copiar para `.env`). Credenciais reais nunca versionadas. Regra: uma variável entra no `.env.example` no mesmo passo em que passa a ser utilizada; as variáveis já listadas indicam o passo que as consumirá.

| Variável                                                                       | Uso                                                   | Passo |
| ------------------------------------------------------------------------------ | ----------------------------------------------------- | ----- |
| `NODE_ENV`                                                                     | Ambiente de execução                                  | 2     |
| `TZ`                                                                           | Sempre `UTC` (timezone de exibição é por organização) | 2     |
| `MYSQL_HOST_PORT`, `REDIS_HOST_PORT`                                           | Portas do MySQL/Redis no host (padrão 3307/6380)      | 2     |
| `API_PORT`, `WEB_PORT`                                                         | Portas da API e do frontend no host                   | 4/5   |
| `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD`        | Container MySQL (obrigatórias no compose)             | 2     |
| `DATABASE_URL`                                                                 | Conexão Prisma (runtime e migrations)                 | 3     |
| `SHADOW_DATABASE_URL`                                                          | Shadow database do `prisma migrate dev`               | 3     |
| `TEST_DATABASE_URL`                                                            | Banco dos testes de integração (≠ `DATABASE_URL`)     | 3     |
| `DATABASE_ALLOW_PUBLIC_KEY_RETRIEVAL`                                          | `true` só em dev sem TLS (caching_sha2_password)      | 3     |
| `REDIS_URL`                                                                    | Conexão Redis (database 0)                            | 3     |
| `TEST_REDIS_URL`                                                               | Redis dos testes de integração (database 15)          | 3     |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`                                      | Assinatura de tokens                                  | 6     |
| `ENCRYPTION_KEY`                                                               | Criptografia das API Keys (32 bytes base64)           | 10    |
| `CORS_ORIGINS`                                                                 | Origens permitidas                                    | 4     |
| `SEED_SUPER_ADMIN_EMAIL`, `SEED_SUPER_ADMIN_PASSWORD`, `SEED_SUPER_ADMIN_NAME` | Seed de desenvolvimento (senha ≥ 12, sem `change-me`) | 3     |

## 23. Migrations

Prisma Migrate, migrations versionadas em `packages/database/prisma/migrations/`.

| Migration             | Conteúdo                                                                        |
| --------------------- | ------------------------------------------------------------------------------- |
| `20260923214105_init` | `users`, `organizations`, `organization_members`, `audit_logs`, `feature_flags` |

Fluxo:

```bash
docker compose up -d                                        # MySQL + Redis
docker compose run --rm tools pnpm install
docker compose run --rm tools pnpm db:migrate:deploy        # aplica migrations
docker compose run --rm tools pnpm db:seed                  # dados de desenvolvimento
# ao alterar o schema:
docker compose run --rm tools pnpm db:migrate:dev --name <descricao>
```

Regras: nunca editar uma migration já aplicada/commitada (criar uma nova); `migrate dev` apenas em desenvolvimento; em produção/CI usar `migrate deploy`.

### Seed (`pnpm db:seed`)

Idempotente — pode rodar várias vezes:

| Dado                | Comportamento                                                                                                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Super Admin         | Criado a partir de `SEED_SUPER_ADMIN_*` (e-mail normalizado para minúsculas, argon2id, e-mail verificado). Se já existir, **a senha não é sobrescrita** |
| Organização Demo    | `slug=demo`, `America/Sao_Paulo`, `pt-BR`; Super Admin vinculado como ADMIN                                                                             |
| Feature flags       | As 4 de `FEATURE_FLAGS`, criadas desabilitadas; estado existente é preservado                                                                           |
| Marca/Campanha Demo | Adicionadas nos PASSOS 8 e 21, quando as tabelas existirem                                                                                              |

Saída em JSON de uma linha (`{"level":"info","service":"database-seed",...}`), sem senhas.

## 24. Testes e qualidade

Scripts da raiz:

| Script                  | O que faz                                                |
| ----------------------- | -------------------------------------------------------- |
| `pnpm format:check`     | Prettier em modo verificação (`pnpm format` aplica)      |
| `pnpm lint`             | ESLint type-aware em todo o monorepo, `--max-warnings=0` |
| `pnpm build`            | Build de todos os pacotes (`pnpm -r build`)              |
| `pnpm typecheck`        | `tsc --noEmit` em cada pacote                            |
| `pnpm test`             | Testes unitários de cada pacote (`pnpm -r test`)         |
| `pnpm test:integration` | Testes de integração (exigem MySQL e Redis)              |
| `pnpm validate`         | format:check → **build** → lint → typecheck → test       |

O `validate` roda o build **antes** do lint: o ESLint type-aware resolve os pacotes do workspace pelo `dist/`, então lintar antes do build acusa tipos inexistentes/desatualizados.

Via Docker: `docker compose run --rm tools pnpm validate` (código montado) ou `docker build --target validate .` (imagem limpa, estilo CI, sem banco). Integração: `docker compose up -d` e `docker compose run --rm tools pnpm test:integration`.

Testes existentes (Vitest):

| Arquivo                                                 | Tipo       | Cobertura                                                                                                |
| ------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------- |
| `packages/types/src/index.test.ts`                      | unitário   | Unicidade das constantes, prioridade padrão, filas (nome = chave, sem `:`), papéis de organização, flags |
| `packages/shared/src/secrets.test.ts`                   | unitário   | Mascaramento, tamanho fixo, segredos curtos, vazios, espaços, opções                                     |
| `packages/database/src/prisma.test.ts`                  | unitário   | Conversão de URL, decodificação, porta padrão, erros sem vazar senha                                     |
| `packages/database/src/seed/config.test.ts`             | unitário   | Validação das credenciais do seed (e-mail, tamanho, valor de exemplo, senha fora da mensagem)            |
| `packages/database/src/enums.test.ts`                   | unitário   | Paridade `OrganizationRole` (Prisma) × `ORGANIZATION_ROLES`                                              |
| `packages/database/src/database.integration.test.ts`    | integração | MySQL 8/UTC, seed completo e idempotente, UUID v7, unicidades, padrões, `SET NULL` na auditoria, utf8mb4 |
| `packages/database/src/redis/redis.integration.test.ts` | integração | Lock (exclusão, disputa concorrente, expiração, extensão, withLock), cache, rate limit                   |

Os testes de integração aplicam as migrations no banco de teste (`globalSetup`), recusam rodar se `TEST_DATABASE_URL` for igual a `DATABASE_URL`, limpam as tabelas antes de cada teste e rodam sequencialmente.

Planejado: Jest (backend), Vitest + RTL (frontend), Playwright (E2E). Prioridades: autenticação, permissões, campanhas, geração, scheduler, publicação, failover de IA, circuit breaker, workers, webhooks.

## 25. Observabilidade e logs

_(planejado — PASSO 4 e PASSO 34)_ Logs estruturados em JSON (sem API Keys), métricas, traces e health checks de API, MySQL, Redis, workers, providers de IA, filas e integrações.

## 26. Tratamento de erros

_(planejado — PASSO 4)_ Filters globais com formato de erro padronizado e correlação por `requestId`.

## 27. Deploy

_(planejado — PASSO 40)_ Nenhum deploy sem autorização do usuário. Pipeline CI planejado: lint, typecheck, tests, build (os scripts já existem — `pnpm validate`).

## 28. Backup e restauração

_(planejado — PASSO 40)_

## 29. Troubleshooting

| Sintoma                                                                                  | Causa                                                                                                    | Solução                                                                                                 |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `ERR_PNPM_IGNORED_BUILDS: Ignored build scripts: esbuild`                                | pnpm 12 bloqueia scripts de instalação não aprovados; `onlyBuiltDependencies` não é mais lido            | Aprovar com `pnpm approve-builds <pacote>` (grava `allowBuilds` no `pnpm-workspace.yaml`)               |
| Peer dependency de `typescript-eslint` com TypeScript 7                                  | typescript-eslint 8 suporta TS `<6.1`                                                                    | Manter TypeScript `~6.0` em todos os pacotes                                                            |
| `TS5101: Option 'baseUrl' is deprecated` no `DTS Build` do tsup                          | O tsup injeta `baseUrl` ao gerar `.d.ts`                                                                 | `ignoreDeprecations: "6.0"` em `library.json` (já aplicado)                                             |
| App não encontra `@aom/types`/`@aom/shared` (`Cannot find module .../dist/...`)          | Pacotes ainda não compilados                                                                             | `pnpm build`                                                                                            |
| Prettier acusa todos os arquivos no Windows                                              | Arquivos com CRLF                                                                                        | `.gitattributes` força LF; rodar `pnpm format`                                                          |
| `required variable MYSQL_DATABASE is missing a value`                                    | `.env` ausente ou incompleto                                                                             | `cp .env.example .env` e preencher                                                                      |
| `Bind for 127.0.0.1:3307 failed: port is already allocated`                              | Porta do host em uso por outro processo/container                                                        | Alterar `MYSQL_HOST_PORT` / `REDIS_HOST_PORT` no `.env`                                                 |
| MySQL `Access denied` após trocar a senha no `.env`                                      | O volume `mysql_data` já foi inicializado com a senha antiga (as `MYSQL_*` só valem na 1ª inicialização) | Alterar a senha via SQL, ou recriar o volume: `docker compose down -v` (apaga os dados)                 |
| `pnpm fetch`: `unexpected argument '--frozen-lockfile'`                                  | No pnpm 12 o `fetch` sempre usa o lockfile e não aceita a flag                                           | Usar `pnpm fetch` sem a flag (já aplicado no `Dockerfile`)                                              |
| Serviço `tools` sem dependências (`command not found`)                                   | Volumes de `node_modules` vazios                                                                         | `docker compose run --rm tools pnpm install`                                                            |
| ESLint: `Unsafe member access ... on a type that cannot be resolved` em imports `@aom/*` | `dist/` do pacote ausente ou desatualizado (lint rodou antes do build)                                   | `pnpm build` antes de `pnpm lint` (o `validate` já segue essa ordem)                                    |
| `ERR_PNPM_IGNORED_BUILDS: ... prisma, @prisma/engines`                                   | Scripts de instalação do Prisma não aprovados                                                            | Já aprovados em `allowBuilds`; para novos pacotes: `pnpm approve-builds <pacote>`                       |
| `Cannot find module './generated/prisma/client'`                                         | Client Prisma não gerado                                                                                 | `pnpm db:generate` (os scripts build/typecheck/test já geram)                                           |
| Prisma: `The datasource.url property is required`                                        | `DATABASE_URL` ausente no ambiente (o Prisma 7 não lê `.env` sozinho)                                    | Rodar via `docker compose run --rm tools ...` com `.env` preenchido                                     |
| MariaDB driver: `RSA public key is not available client side`                            | `caching_sha2_password` sem TLS                                                                          | `DATABASE_ALLOW_PUBLIC_KEY_RETRIEVAL=true` (só dev) ou TLS                                              |
| `prisma migrate dev`: erro ao criar shadow database                                      | Usuário sem permissão de `CREATE DATABASE`                                                               | Usar `SHADOW_DATABASE_URL` (`<db>_shadow`, criado pelo init script)                                     |
| Bancos `_test`/`_shadow` inexistentes                                                    | Volume `mysql_data` criado antes do PASSO 3 (init scripts só rodam na 1ª inicialização)                  | Criar manualmente (comandos em `docker/mysql/initdb/01-extra-databases.sh`) ou `docker compose down -v` |
| Seed: `SEED_SUPER_ADMIN_PASSWORD deve ter ao menos 12 caracteres`                        | Senha de exemplo do `.env.example`                                                                       | Definir uma senha real no `.env`                                                                        |
| `prisma` `latest` no npm aponta para release candidate (8.0.0-rc)                        | Tag `latest` do CLI publicada fora de sincronia com `@prisma/client`                                     | Versões fixadas exatamente em 7.10.0 (CLI, client e adapter); atualizar os três juntos                  |

## 30. Decisões arquiteturais importantes

| ADR     | Data       | Decisão                                                                                              | Motivo                                                                                                                                                                                                    |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| —       | 2026-09-23 | Modular Monolith + processos separados para filas e agendamento                                      | Evitar overengineering, mantendo boundaries para futura extração                                                                                                                                          |
| —       | 2026-09-23 | `AIProviderManager` como camada única de resiliência de IA                                           | Desacoplar SDKs e permitir failover/circuit breaker independente do provedor                                                                                                                              |
| —       | 2026-09-23 | Publicação automática somente via APIs oficiais permitidas                                           | Conformidade com termos das plataformas; fallback assistido/manual                                                                                                                                        |
| ADR-001 | 2026-09-23 | Monorepo com **pnpm workspaces** (versão fixada via corepack)                                        | Instalação rápida e determinística, isolamento estrito de dependências (sem phantom deps), workspaces nativos, sem ferramenta extra de orquestração                                                       |
| ADR-002 | 2026-09-23 | Escopo de pacotes internos **`@aom/*`** (AI Organic Marketing)                                       | Nome curto e sem colisão com pacotes públicos                                                                                                                                                             |
| ADR-003 | 2026-09-23 | **Worker e scheduler como entrypoints de `apps/api`** (sem `apps/worker`), em containers distintos   | Ambos dependem dos mesmos módulos de domínio (IA, publicações, Prisma). Um app separado exigiria duplicar ou extrair esses módulos. Processos separados mantêm escala e isolamento de falha independentes |
| ADR-004 | 2026-09-23 | Pacotes compartilhados com **build dual ESM + CJS** (tsup) e código puro, sem dependência de runtime | O frontend (Vite) consome ESM e o NestJS tradicionalmente CJS; código puro mantém os pacotes utilizáveis em ambos                                                                                         |
| ADR-005 | 2026-09-23 | **TypeScript `~6.0`** em vez do TS 7 (nativo)                                                        | typescript-eslint 8 exige `<6.1` e o tsup depende da API JS do compilador. Reavaliar quando o ecossistema suportar TS 7                                                                                   |
| ADR-006 | 2026-09-23 | **Vitest** nos pacotes compartilhados; Jest mantido para o backend (PASSO 4)                         | Pacotes são ESM puros, e o Vitest os testa sem configuração extra; o frontend também usará Vitest. A especificação exige Jest apenas no backend                                                           |
| ADR-007 | 2026-09-23 | **Dockerfile único multi-stage** na raiz para todo o monorepo                                        | Os apps dependem dos pacotes do workspace e de um único lockfile; um Dockerfile por app duplicaria a instalação. Cada app terá seu target de runtime                                                      |
| ADR-008 | 2026-09-23 | **Serviços de aplicação entram no compose junto com os apps** (PASSOS 4 e 5), não no PASSO 2         | Containers sem app seriam placeholders (vedado pela especificação). O PASSO 2 entrega a infraestrutura validável: MySQL, Redis, imagem base e `tools`                                                     |
| ADR-009 | 2026-09-23 | `node_modules` em **volumes nomeados**, código via bind mount                                        | Evita binários nativos do Linux no host Windows (e vice-versa) e I/O lento de bind mount; o host permanece sem `node_modules`                                                                             |
| ADR-010 | 2026-09-23 | **MySQL 8.4 LTS** e **Redis 8** com AOF + `noeviction`                                               | 8.4 é a linha LTS do MySQL 8 (requisito "MySQL 8+"); `noeviction` é exigido pelo BullMQ e o AOF preserva jobs entre reinícios                                                                             |
| ADR-011 | 2026-09-23 | Pacote **`@aom/database`** (somente servidor) com Prisma, migrations, seeds e utilitários Redis      | `apps/api` só nasce no PASSO 4; o pacote isola a camada de dados, é reutilizado por backend/worker/scheduler e mantém o schema testável independentemente da API                                          |
| ADR-012 | 2026-09-23 | **Prisma 7.10** fixado exatamente, com adapter `@prisma/adapter-mariadb`                             | Prisma 7 usa Query Compiler + driver adapter (sem engine Rust de consulta). A tag `latest` do CLI aponta para uma RC; CLI, client e adapter precisam estar na mesma versão                                |
| ADR-013 | 2026-09-23 | **UUID v7** em `CHAR(36)` como chave primária                                                        | IDs não sequenciais expostos com segurança em URLs, mas ordenados no tempo (bom para o índice clusterizado do InnoDB). `CHAR(36)` evita conversões de `BINARY(16)` no Prisma                              |
| ADR-014 | 2026-09-23 | **SUPER_ADMIN como flag do usuário** (`is_super_admin`); papéis de organização em enum próprio       | SUPER_ADMIN é da plataforma, não de uma organização. Permissões granulares (Role/Permission) ficam para o PASSO 7                                                                                         |
| ADR-015 | 2026-09-23 | Schema **incremental**: tabelas criadas no passo em que passam a ser usadas                          | Evita esquema especulativo. Role/Permission → PASSO 7, SystemSetting → PASSO 9, Brand (+ seed Marca Demo) → PASSO 8, Campaign (+ seed Campanha Demo) → PASSO 21                                           |
| ADR-016 | 2026-09-23 | Testes de integração com **MySQL e Redis reais** em bancos dedicados (`_test`, Redis db 15)          | Mocks de banco não validam constraints, charset, UTC nem atomicidade dos scripts Lua                                                                                                                      |
