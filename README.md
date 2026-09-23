# AI Organic Marketing Automation

Plataforma de automação de marketing orgânico com IA (monorepo: NestJS + React + MySQL + Redis + BullMQ).

> Documentação técnica completa: [`DOCUMENTACAO.md`](DOCUMENTACAO.md) · Estado do projeto: [`CONTEXTO.md`](CONTEXTO.md) · Roadmap: [`PASSOS.md`](PASSOS.md)

## Requisitos

- **Docker** (com Docker Compose v2) — único requisito obrigatório no host.
- Opcional, para integração completa no editor: **Node.js 24** (ver `.nvmrc`) com `corepack enable` (o pnpm é fixado em `package.json` → `packageManager`).

## Configuração

```bash
cp .env.example .env
# edite .env e troque todos os valores "change-me"
```

O `docker compose` falha com mensagem explícita se as variáveis obrigatórias do MySQL não estiverem definidas.

## Comandos Docker

```bash
docker compose up -d            # sobe MySQL e Redis (aguarda com: --wait)
docker compose ps               # status e healthchecks
docker compose logs -f mysql    # logs de um serviço
docker compose down             # para os serviços (mantém os dados)
docker compose down -v          # para e APAGA os volumes (dados do banco e do Redis)
```

Ferramentas do monorepo sem Node no host (serviço `tools`, perfil `tools`):

```bash
docker compose run --rm tools pnpm install     # primeira vez / após mudar dependências
docker compose run --rm tools pnpm validate    # format:check + lint + build + typecheck + test
docker compose run --rm tools sh               # shell interativo com pnpm
```

Validação no estilo CI (imagem limpa, sem volumes):

```bash
docker build --target validate .
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

| Serviço | Endereço no host                     | Credenciais                               |
| ------- | ------------------------------------ | ----------------------------------------- |
| MySQL   | `127.0.0.1:3307` (`MYSQL_HOST_PORT`) | `MYSQL_USER` / `MYSQL_PASSWORD` do `.env` |
| Redis   | `127.0.0.1:6380` (`REDIS_HOST_PORT`) | sem senha em desenvolvimento              |

As portas são publicadas apenas em `127.0.0.1`. A API (PASSO 4) e o frontend (PASSO 5) ainda não existem.

## Testes

- Pacotes compartilhados (`packages/*`): Vitest (`pnpm test`).
- Backend: Jest (a partir do PASSO 4). Frontend: Vitest + React Testing Library (PASSO 5). E2E: Playwright (PASSO 35).
