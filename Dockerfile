# syntax=docker/dockerfile:1
#
# Dockerfile multi-stage único do monorepo.
#   base     → Node + pnpm (versão fixada em package.json → packageManager)
#   dev      → imagem de ferramentas; o código é montado via volume (serviço `tools`)
#   build    → dependências instaladas e pacotes compilados (base para as imagens dos apps)
#   validate → executa format:check, lint, typecheck e testes (uso em CI: --target validate)
#
# Targets de runtime dos apps (api/worker/scheduler e web) são adicionados nos PASSOS 4 e 5.

ARG NODE_VERSION=24

FROM node:${NODE_VERSION}-alpine AS base
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    TZ=UTC
WORKDIR /workspace
RUN corepack enable
COPY package.json ./
# Baixa a versão exata do pnpm declarada em packageManager para dentro da imagem
# e fixa o store fora do diretório do projeto (volume próprio no serviço `tools`).
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
