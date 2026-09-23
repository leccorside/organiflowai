# syntax=docker/dockerfile:1
#
# Dockerfile multi-stage único do monorepo.
#   base      → Node + pnpm (versão fixada em package.json → packageManager)
#   dev       → imagem de desenvolvimento; o código é montado via volume
#               (serviços tools, setup, backend, worker e scheduler do docker-compose)
#   build     → dependências instaladas e pacotes compilados
#   validate  → format:check, lint, typecheck e testes unitários (CI: --target validate)
#   api-build → build da API + `pnpm deploy` (somente dependências de produção)
#   api       → imagem de produção da API; a MESMA imagem roda backend, worker e scheduler
#               (CMD padrão = HTTP; worker/scheduler sobrescrevem o comando)
#
# Target de runtime do frontend (web) é adicionado no PASSO 5.

ARG NODE_VERSION=24

FROM node:${NODE_VERSION}-alpine AS base
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    PRISMA_HIDE_UPDATE_MESSAGE=true \
    TZ=UTC
WORKDIR /workspace
RUN corepack enable
COPY package.json ./
# Baixa a versão exata do pnpm declarada em packageManager para dentro da imagem
# e fixa o store fora do diretório do projeto (volume próprio em desenvolvimento).
RUN corepack install && pnpm config set store-dir /pnpm/store --global

FROM base AS dev
CMD ["sh"]

FROM base AS build
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
# `pnpm fetch` depende apenas do lockfile: esta camada só é refeita quando as dependências mudam.
RUN --mount=type=cache,id=aom-pnpm-store,target=/pnpm/store \
    pnpm fetch --store-dir /pnpm/store
COPY . .
RUN --mount=type=cache,id=aom-pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --offline --store-dir /pnpm/store
RUN pnpm build

FROM build AS validate
RUN pnpm format:check && pnpm lint && pnpm typecheck && pnpm test

FROM build AS api-build
# Pasta autocontida com dist/ e apenas dependências de produção (inclui os pacotes do workspace).
RUN --mount=type=cache,id=aom-pnpm-store,target=/pnpm/store \
    pnpm --filter @aom/api deploy --prod --legacy --store-dir /pnpm/store /out/api

FROM node:${NODE_VERSION}-alpine AS api
ENV NODE_ENV=production \
    TZ=UTC
WORKDIR /app
COPY --from=api-build --chown=node:node /out/api ./
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
