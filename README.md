# AI Organic Marketing Automation

Plataforma de automação de marketing orgânico com IA (monorepo: NestJS + React + MySQL + Redis + BullMQ).

> Documentação técnica completa: [`DOCUMENTACAO.md`](DOCUMENTACAO.md) · Estado do projeto: [`CONTEXTO.md`](CONTEXTO.md) · Roadmap: [`PASSOS.md`](PASSOS.md)

## Requisitos

- **Docker** (com Docker Compose v2) — único requisito obrigatório no host.
- Opcional, para rodar ferramentas fora do Docker ou ter integração completa no editor: **Node.js 24** (ver `.nvmrc`) com `corepack enable` (o pnpm é fixado em `package.json` → `packageManager`).

## Configuração

```bash
cp .env.example .env
# edite .env e troque todos os valores "change-me"
```

## Comandos Docker

O ambiente completo via `docker compose up -d` é criado no **PASSO 2**. Até lá, a validação do monorepo roda em um container efêmero:

```bash
docker run --rm -v "$PWD:/src:ro" -e COREPACK_ENABLE_DOWNLOAD_PROMPT=0 node:24-alpine sh -c \
  "mkdir /app && tar -C /src --exclude=node_modules --exclude=.git -cf - . | tar -xf - -C /app && \
   cd /app && corepack enable && pnpm install --frozen-lockfile && pnpm validate"
```

## Comandos (com Node 24 no host)

```bash
corepack enable
pnpm install
pnpm validate       # format:check + lint + build + typecheck + test
pnpm lint           # ESLint (type-aware)
pnpm typecheck      # tsc em todos os pacotes
pnpm test           # testes de todos os pacotes
pnpm build          # build de todos os pacotes
pnpm format         # aplica Prettier
```

## Acesso

Ainda não há serviços em execução (a API é criada no PASSO 4 e o frontend no PASSO 5).

## Testes

- Pacotes compartilhados (`packages/*`): Vitest (`pnpm test`).
- Backend: Jest (a partir do PASSO 4). Frontend: Vitest + React Testing Library (PASSO 5). E2E: Playwright (PASSO 35).
