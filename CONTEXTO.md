# CONTEXTO.md — Memória Técnica do Projeto

> Ler este arquivo e o `PASSOS.md` antes de iniciar qualquer passo. Consultar `DOCUMENTACAO.md` quando necessário.
> Antes de cada passo, verificar o estado real do código e o `git status`/`git diff` (o usuário pode alterar código manualmente entre passos).

---

## O que é o sistema

**AI Organic Marketing Automation**: plataforma para criar, organizar, agendar, publicar, distribuir, analisar e otimizar conteúdo de marketing **orgânico** (sem anúncios pagos) usando inteligência artificial, em vários canais digitais.

## Objetivo principal

Permitir que uma empresa cadastre a marca, configure canais e provedores de IA (com prioridade e failover), defina objetivos, crie campanhas e deixe a IA gerar a estratégia e os conteúdos adaptados por canal. O usuário aprova (ou usa o modo automático), o sistema agenda e publica pelas integrações permitidas, coleta analytics e usa os resultados para melhorar os próximos conteúdos.

## Arquitetura atual

Monorepo **pnpm workspaces** com tooling, pacotes compartilhados e infraestrutura Docker (MySQL 8.4 e Redis 8 via `docker compose up -d`, `Dockerfile` multi-stage, serviço `tools` para rodar pnpm sem Node no host). A camada de dados existe em `@aom/database`: schema Prisma com migration `init`, seed idempotente e utilitários Redis (lock, cache, rate limit). Ainda **não existem apps** (api/web).

Arquitetura planejada: Modular Monolith (NestJS) + processos worker e scheduler (entrypoints separados da própria api, em containers distintos) + frontend React, tudo em Docker.

## Tecnologias

| Camada           | Tecnologia                                                                                         | Status    |
| ---------------- | -------------------------------------------------------------------------------------------------- | --------- |
| Runtime / pacote | Node.js 24, pnpm 12.6 (fixado em `packageManager`)                                                 | Em uso    |
| Linguagem        | TypeScript **6.0** (não 7 — ver Limitações)                                                        | Em uso    |
| Qualidade        | ESLint 10 (flat config, type-aware via typescript-eslint 8), Prettier 3                            | Em uso    |
| Pacotes internos | tsup 8 (build ESM + CJS + `.d.ts`), Vitest 5                                                       | Em uso    |
| Frontend         | React, TypeScript, Vite, React Router, TanStack Query, Zustand, React Hook Form, Zod, Tailwind CSS | PASSO 5   |
| Backend          | NestJS (REST + WebSocket/SSE)                                                                      | PASSO 4   |
| Banco            | MySQL 8.4 + Prisma 7.10 (adapter mariadb, Query Compiler)                                          | Em uso    |
| Cache/filas      | Redis 8 + ioredis 6 (BullMQ no PASSO 23)                                                           | Em uso    |
| Senhas           | argon2id (`@node-rs/argon2`)                                                                       | Em uso    |
| Infra            | Docker / docker compose, MySQL 8.4 LTS, Redis 8                                                    | Em uso    |
| Testes           | Jest (backend), Vitest + RTL (frontend), Playwright (E2E)                                          | Planejado |

## Serviços existentes

| Serviço | Onde                                      | Observação                                                                              |
| ------- | ----------------------------------------- | --------------------------------------------------------------------------------------- |
| `mysql` | `127.0.0.1:3307` (`MYSQL_HOST_PORT`)      | utf8mb4, timezone `+00:00`, volume `mysql_data`; bancos `aom`, `aom_test`, `aom_shadow` |
| `redis` | `127.0.0.1:6380` (`REDIS_HOST_PORT`)      | AOF + `noeviction` (BullMQ), volume `redis_data`                                        |
| `tools` | `docker compose run --rm tools <comando>` | Perfil `tools`; bind mount do código, `node_modules` em volumes                         |

Portas padrão fora de 3306/6379 porque o host já tem outro projeto usando 6379.

## Estrutura principal

```text
apps/                 # (vazio) api no PASSO 4, web no PASSO 5
packages/
  config/             # @aom/config — tsconfig base e de bibliotecas
  types/              # @aom/types — contratos de domínio (roles, status, canais, IA, filas)
  shared/             # @aom/shared — utilitários puros (maskSecret)
  database/           # @aom/database — SOMENTE servidor: Prisma (schema, migrations, seed) + Redis
docker/mysql/initdb/  # cria <db>_test e <db>_shadow na 1ª inicialização do MySQL
eslint.config.mjs     # lint único na raiz, type-aware
pnpm-workspace.yaml   # workspaces + allowBuilds (esbuild, prisma, @prisma/engines)
Dockerfile            # multi-stage: base, dev, build, validate
docker-compose.yml    # mysql, redis, tools
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
- Docker: `docker compose up -d` (MySQL + Redis saudáveis), `docker compose run --rm tools pnpm validate`, `docker build --target validate .` (CI).

## Decisões tomadas

- Seguir integralmente a especificação do `PROMPT.md`.
- Execução estritamente por passos, somente com autorização explícita (`INICIE O PASSO X`).
- Commits e pushes feitos **manualmente pelo usuário**; a IA apenas sugere a mensagem (Conventional Commits).
- ADR-001 a ADR-006 em `DOCUMENTACAO.md` §30 (pnpm workspaces; escopo `@aom`; worker/scheduler como entrypoints da api; build dual ESM/CJS dos pacotes; TypeScript 6.0; Vitest nos pacotes compartilhados).
- ADR-007 a ADR-010 (PASSO 2): Dockerfile único multi-stage; serviços de aplicação entram no compose junto com os apps (PASSOS 4/5); `node_modules` em volumes nomeados; MySQL 8.4 LTS + Redis 8 com AOF e `noeviction`.
- ADR-011 a ADR-016 (PASSO 3): pacote `@aom/database` somente servidor; Prisma 7.10 fixado + adapter mariadb; UUID v7 em `CHAR(36)`; SUPER_ADMIN como flag do usuário; schema incremental (tabelas no passo em que são usadas); testes de integração com MySQL/Redis reais.

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

| Módulo                         | Status       |
| ------------------------------ | ------------ |
| Tooling do monorepo            | Concluído    |
| `@aom/config`                  | Concluído    |
| `@aom/types`                   | Concluído    |
| `@aom/shared`                  | Concluído    |
| Docker (mysql, redis, tools)   | Concluído    |
| `@aom/database`                | Concluído    |
| api / worker / scheduler / web | Não iniciado |

## Limitações conhecidas

- **TypeScript fixado em `~6.0`**: o TS 7 (nativo) é o `latest`, mas o typescript-eslint 8 exige `<6.1` e o tsup depende da API JS do compilador. Reavaliar quando o ecossistema suportar TS 7.
- **`ignoreDeprecations: "6.0"`** em `packages/config/tsconfig/library.json`: o tsup injeta `baseUrl` (depreciado no TS 6) ao gerar `.d.ts`. O projeto não usa opções depreciadas; remover ao migrar o bundler (ex.: tsdown) ou quando o tsup corrigir.
- Os pacotes `@aom/types` e `@aom/shared` precisam de `pnpm build` antes de serem consumidos por apps (exports apontam para `dist/`).
- Redis sem senha em desenvolvimento (porta só em `127.0.0.1`); autenticação no hardening (PASSO 37).
- Em Docker Desktop no Windows, eventos de arquivo do host não chegam ao container: hot reload dos apps (PASSOS 4/5) precisará de polling.
- As variáveis `MYSQL_*` e o init script (`_test`/`_shadow`) só valem na primeira inicialização do volume `mysql_data`.
- **Prisma fixado em 7.10.0** (CLI, client e adapter na mesma versão; a tag `latest` do CLI aponta para uma RC 8.0). Atualizar os três juntos.
- `DATABASE_URL` repete usuário/senha de `MYSQL_*` (precisam ser mantidos em sincronia manualmente no `.env`).
- `allowPublicKeyRetrieval` habilitado só em desenvolvimento; produção exigirá TLS no MySQL (PASSO 37/40).
- Collation das tabelas: o Prisma impõe `utf8mb4_unicode_ci` por tabela (servidor usa `utf8mb4_0900_ai_ci`); ambas case-insensitive.
- E-mail único mesmo com soft delete: usuário removido logicamente bloqueia o e-mail até tratamento no PASSO 6 (ex.: anonimizar ao remover).
- O seed não sobrescreve a senha de um Super Admin já existente (trocar senha é fluxo do PASSO 6).

## Último passo concluído

**PASSO 3 — Banco MySQL, Prisma e Redis** (2026-09-23).

## Próximo passo

**PASSO 4 — Backend base e padrões arquiteturais** (aguardando autorização: `INICIE O PASSO 4`).

## Pendências

- O usuário precisa criar o `.env` (`cp .env.example .env`, senhas reais, `SEED_SUPER_ADMIN_PASSWORD` com ≥ 12 caracteres) antes do primeiro `docker compose up -d`, depois `pnpm db:migrate:deploy` e `pnpm db:seed` via `tools`.
- PASSO 4: consumir `@aom/database` no NestJS. Validar o consumo do build CJS/ESM (Prisma Client gerado usa `import.meta.url`, tratado com `--shims` no tsup) conforme o formato de módulo escolhido para a API.

## Bugs conhecidos

Nenhum.

## Decisões que NÃO devem ser revertidas

- Failover entre provedores de IA gerenciado pelo `AIProviderManager` da aplicação (mesmo que o OpenRouter tenha fallback próprio).
- Stack obrigatória: React + NestJS + MySQL/Prisma + Redis/BullMQ + Docker.
- Execução por passos com parada obrigatória e commits manuais.
- Worker e scheduler compartilham a base de código de `apps/api` (ADR-003) — não criar `apps/worker` duplicando módulos de domínio.
- Redis com `maxmemory-policy noeviction` (exigência do BullMQ) — nunca trocar para uma política com eviction.
- Datas e servidores em UTC (MySQL `default-time-zone=+00:00`, `TZ=UTC` nos containers).
- Testes de integração nunca rodam contra o banco de desenvolvimento (guarda em `integration-setup.ts`).
- Migrations já commitadas nunca são editadas; alterações de schema geram nova migration.
- Senhas somente com argon2id; credenciais de seed apenas via variáveis de ambiente.

---

## Histórico

- 2026-09-23 — Criados `DOCUMENTACAO.md`, `CONTEXTO.md` e `PASSOS.md` a pedido do usuário, antes do PASSO 1.
- 2026-09-23 — **PASSO 1 concluído**: monorepo pnpm, tooling (TS/ESLint/Prettier), pacotes `@aom/config`, `@aom/types`, `@aom/shared`, `.env.example`, `README.md`, ADRs. Erros encontrados e corrigidos: (1) pnpm 12 não reconhece mais `onlyBuiltDependencies` → substituído por `allowBuilds` via `pnpm approve-builds esbuild`; (2) TS 7 incompatível com typescript-eslint/tsup → fixado TS `~6.0`; (3) tsup falhava no `.d.ts` por `baseUrl` depreciado → `ignoreDeprecations: "6.0"` no tsconfig de bibliotecas.
- 2026-09-23 — **PASSO 2 concluído**: `docker-compose.yml` (mysql 8.4, redis 8, tools), `Dockerfile` multi-stage (base/dev/build/validate), `.dockerignore`, portas do host no `.env.example`. Validado: compose falha sem `.env`; mysql e redis saudáveis; utf8mb4 + UTC confirmados; `noeviction` + AOF confirmados; dados persistem após restart; `pnpm validate` passa via `tools` e via `docker build --target validate`. Erro corrigido: `pnpm fetch --frozen-lockfile` não existe no pnpm 12 → flag removida. Porta 6379 do host ocupada por outro projeto → padrões 3307/6380. Serviços de app movidos para os PASSOS 4/5 (ADR-008).
- 2026-09-23 — **PASSO 3 concluído**: pacote `@aom/database` (Prisma 7.10 + adapter mariadb, schema com 5 tabelas, migration `init`, seed idempotente, utilitários Redis), bancos `_test`/`_shadow` via init script, `ORGANIZATION_ROLES`/`FEATURE_FLAGS` em `@aom/types`. Validado: 36 testes unitários + 19 de integração (MySQL/Redis reais), seed recusa senha de exemplo e é idempotente, dist CJS/ESM consumível (consulta real), `docker build --target validate` sem banco. Erros corrigidos: (1) tag `latest` do `prisma` aponta para RC → versões fixadas em 7.10.0; (2) pnpm bloqueou scripts do Prisma → `approve-builds prisma @prisma/engines`; (3) checagem de senha de exemplo nunca executava (placeholders < 12 caracteres) → regra por padrão `change-?me`; (4) lint falhava por rodar antes do build (dist desatualizado) → `validate` agora faz build antes do lint. Roadmap: Role/Permission → PASSO 7, SystemSetting → PASSO 9, Marca Demo → PASSO 8, Campanha Demo → PASSO 21 (ADR-015).
