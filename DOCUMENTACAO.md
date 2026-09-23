# DOCUMENTACAO.md — Documentação Técnica

> Documentação técnica principal do projeto **AI Organic Marketing Automation**.
> Deve ser atualizada a cada alteração relevante; código e documentação não podem ficar inconsistentes.
>
> **Status atual:** PASSO 1 concluído — monorepo, tooling e pacotes compartilhados. Itens marcados como _(planejado)_ ainda não existem.

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

Pacotes compartilhados (`packages/*`) contêm apenas código **puro e agnóstico de runtime** (sem NestJS, sem React, sem I/O), para poderem ser consumidos pelo backend e pelo frontend.

## 4. Stack

| Camada           | Tecnologia                                                                                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime          | Node.js 24 (`.nvmrc`), pnpm 12.6 (fixado em `package.json` → `packageManager`, via corepack)                                                                  |
| Linguagem        | TypeScript 6.0                                                                                                                                                |
| Qualidade        | ESLint 10 (flat config, typescript-eslint 8 type-aware), Prettier 3                                                                                           |
| Pacotes internos | tsup 8 (ESM + CJS + `.d.ts`), Vitest 5                                                                                                                        |
| Frontend         | React, TypeScript, Vite, React Router, TanStack Query, Zustand, React Hook Form, Zod, Tailwind CSS, biblioteca de componentes acessíveis, gráficos, PWA-ready |
| Backend          | NestJS, REST, WebSocket/SSE                                                                                                                                   |
| Banco            | MySQL 8+, Prisma ORM                                                                                                                                          |
| Cache / filas    | Redis, BullMQ                                                                                                                                                 |
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
│   │   └── src/ (ai, channels, content, queues, roles, index)
│   └── shared/                  # @aom/shared — utilitários puros
│       └── src/ (secrets, index)
├── eslint.config.mjs            # ESLint único para todo o monorepo
├── package.json                 # scripts raiz e ferramentas de qualidade
├── pnpm-workspace.yaml          # workspaces (apps/*, packages/*) + allowBuilds
├── pnpm-lock.yaml
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

_(planejado — PASSO 3)_ MySQL 8 + Prisma. Convenções: UUIDs, timestamps, soft delete onde fizer sentido, índices, constraints e auditoria. Entidades centrais: User, Organization, OrganizationMember, Brand, Project, Campaign, Channel, SocialAccount, Content, Publication, Automation, AIProvider, Analytics, PromptTemplate, BrandMemory, AuditLog. Enums do Prisma devem espelhar as constantes de `@aom/types`.

## 9. Redis

_(planejado — PASSO 3)_ Cache, sessões, locks distribuídos, rate limit, filas, scheduler, prevenção de execuções duplicadas, estado do circuit breaker e health checks temporários.

## 10. Filas

_(planejado — PASSO 23)_ Nomes já definidos em `@aom/types` → `QUEUE_NAMES` (o valor é o nome real no Redis; sem `:`, exigência do BullMQ, garantida por teste):

`AI_GENERATION`, `CONTENT_PROCESSING`, `CONTENT_PUBLICATION`, `CONTENT_SCHEDULING`, `ANALYTICS_COLLECTION`, `AI_HEALTH_CHECK`, `NOTIFICATIONS`, `SEO_ANALYSIS`, `WEBHOOK_PROCESSING`.

Políticas: retry, backoff exponencial, dead letter, idempotência, timeout e controle de concorrência.

## 11. Docker

_(planejado — PASSO 2)_ `docker-compose.yml` com `frontend`, `backend`, `mysql`, `redis`, `worker`, `scheduler` (e `nginx` quando necessário). `backend`, `worker` e `scheduler` usam a mesma imagem de `apps/api` com comandos diferentes. Execução via `docker compose up -d`.

Até o PASSO 2, a validação roda em container efêmero `node:24-alpine` (comando no `README.md`), copiando o repositório sem `node_modules` para dentro do container.

## 12. Serviços

Nenhum serviço em execução ainda.

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

### `@aom/shared`

| Export                         | Descrição                                                                                                                                                                                    |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `maskSecret(secret, options?)` | Mascara segredos para exibição (`••••••••••abcd`). Máscara de tamanho fixo (não revela o comprimento), mostra só os 4 últimos caracteres e mascara totalmente segredos com até 8 caracteres. |
| `SECRET_MASK_CHAR`             | Caractere da máscara (`•`).                                                                                                                                                                  |

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

_(planejado)_ Helmet, CORS restritivo, rate limiting, validação, sanitização, proteção contra injection, CSRF quando aplicável, hash seguro de senhas, criptografia das chaves, logs sem secrets, menor privilégio, proteção SSRF, validação de webhooks.

## 22. Variáveis de ambiente

Definidas em `.env.example` (copiar para `.env`). Credenciais reais nunca versionadas. Regra: uma variável entra no `.env.example` no mesmo passo em que passa a ser utilizada; as variáveis já listadas indicam o passo que as consumirá.

| Variável                                                                | Uso                                                   | Passo |
| ----------------------------------------------------------------------- | ----------------------------------------------------- | ----- |
| `NODE_ENV`                                                              | Ambiente de execução                                  | 2     |
| `TZ`                                                                    | Sempre `UTC` (timezone de exibição é por organização) | 2     |
| `API_PORT`, `WEB_PORT`                                                  | Portas expostas no host                               | 2     |
| `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD` | Container MySQL                                       | 2/3   |
| `DATABASE_URL`                                                          | Conexão Prisma                                        | 3     |
| `REDIS_URL`                                                             | Conexão Redis/BullMQ                                  | 3     |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`                               | Assinatura de tokens                                  | 6     |
| `ENCRYPTION_KEY`                                                        | Criptografia das API Keys (32 bytes base64)           | 10    |
| `CORS_ORIGINS`                                                          | Origens permitidas                                    | 4     |
| `SEED_SUPER_ADMIN_EMAIL`, `SEED_SUPER_ADMIN_PASSWORD`                   | Seed de desenvolvimento                               | 3     |

## 23. Migrations

_(planejado — PASSO 3)_ Prisma Migrate e seeds (Super Admin, Organização Demo, Marca Demo, Campanha Demo; credenciais via env).

## 24. Testes e qualidade

Scripts da raiz:

| Script              | O que faz                                                |
| ------------------- | -------------------------------------------------------- |
| `pnpm format:check` | Prettier em modo verificação (`pnpm format` aplica)      |
| `pnpm lint`         | ESLint type-aware em todo o monorepo, `--max-warnings=0` |
| `pnpm build`        | Build de todos os pacotes (`pnpm -r build`)              |
| `pnpm typecheck`    | `tsc --noEmit` em cada pacote                            |
| `pnpm test`         | Testes de cada pacote (`pnpm -r test`)                   |
| `pnpm validate`     | Todos os anteriores, em sequência                        |

Testes existentes (Vitest):

- `packages/types/src/index.test.ts` — unicidade das constantes, prioridade padrão cobre todos os provedores, nomes de fila iguais às chaves e sem `:`.
- `packages/shared/src/secrets.test.ts` — mascaramento, tamanho fixo, segredos curtos, valores vazios, espaços e opções.

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

| Sintoma                                                                         | Causa                                                                                         | Solução                                                                                   |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `ERR_PNPM_IGNORED_BUILDS: Ignored build scripts: esbuild`                       | pnpm 12 bloqueia scripts de instalação não aprovados; `onlyBuiltDependencies` não é mais lido | Aprovar com `pnpm approve-builds <pacote>` (grava `allowBuilds` no `pnpm-workspace.yaml`) |
| Peer dependency de `typescript-eslint` com TypeScript 7                         | typescript-eslint 8 suporta TS `<6.1`                                                         | Manter TypeScript `~6.0` em todos os pacotes                                              |
| `TS5101: Option 'baseUrl' is deprecated` no `DTS Build` do tsup                 | O tsup injeta `baseUrl` ao gerar `.d.ts`                                                      | `ignoreDeprecations: "6.0"` em `library.json` (já aplicado)                               |
| App não encontra `@aom/types`/`@aom/shared` (`Cannot find module .../dist/...`) | Pacotes ainda não compilados                                                                  | `pnpm build`                                                                              |
| Prettier acusa todos os arquivos no Windows                                     | Arquivos com CRLF                                                                             | `.gitattributes` força LF; rodar `pnpm format`                                            |

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
