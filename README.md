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
# (mantenha usuário/senha das *_DATABASE_URL iguais a MYSQL_USER/MYSQL_PASSWORD;
#  SEED_SUPER_ADMIN_PASSWORD precisa de 12+ caracteres)
```

O `docker compose` falha com mensagem explícita se as variáveis obrigatórias do MySQL não estiverem definidas.

## Primeira execução

```bash
docker compose up -d --wait                            # MySQL + Redis saudáveis
docker compose run --rm tools pnpm install             # dependências (volumes Docker)
docker compose run --rm tools pnpm db:migrate:deploy   # cria as tabelas
docker compose run --rm tools pnpm db:seed             # Super Admin + Organização Demo
```

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
docker compose run --rm tools pnpm validate    # format:check + build + lint + typecheck + test
docker compose run --rm tools sh               # shell interativo com pnpm
```

Banco de dados (Prisma):

```bash
docker compose run --rm tools pnpm db:migrate:dev --name <descricao>  # nova migration após alterar o schema
docker compose run --rm tools pnpm db:migrate:deploy                  # aplica migrations pendentes
docker compose run --rm tools pnpm db:migrate:status                  # estado das migrations
docker compose run --rm tools pnpm db:seed                            # seed idempotente
docker compose run --rm tools pnpm db:generate                        # regenera o Prisma Client
```

Validação no estilo CI (imagem limpa, sem volumes):

```bash
docker build --target validate .
```

## Comandos (com Node 24 no host)

```bash
corepack enable
pnpm install
pnpm validate       # format:check + build + lint + typecheck + test
pnpm lint           # ESLint (type-aware; requer pnpm build antes)
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

As portas são publicadas apenas em `127.0.0.1`. Usuário inicial da plataforma: `SEED_SUPER_ADMIN_EMAIL` / `SEED_SUPER_ADMIN_PASSWORD` (criado pelo seed). A API (PASSO 4) e o frontend (PASSO 5) ainda não existem.

## Testes

```bash
docker compose run --rm tools pnpm test               # unitários (sem banco)
docker compose up -d --wait
docker compose run --rm tools pnpm test:integration   # integração: MySQL (<db>_test) + Redis (db 15)
```

- Pacotes (`packages/*`): Vitest. Testes de integração nunca usam o banco de desenvolvimento.
- Backend: Jest (a partir do PASSO 4). Frontend: Vitest + React Testing Library (PASSO 5). E2E: Playwright (PASSO 35).
