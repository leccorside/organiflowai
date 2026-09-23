# PASSOS.md — Roadmap Oficial

Roadmap oficial do projeto **AI Organic Marketing Automation**.

Regras:

- Executar **somente** o passo autorizado explicitamente (`INICIE O PASSO X`).
- Nunca marcar `[x]` sem implementação e validação real (lint, typecheck, testes, build quando aplicável).
- Ao concluir um passo: atualizar `DOCUMENTACAO.md`, `CONTEXTO.md` e este arquivo, gerar sugestão de commit (sem commitar) e parar.
- Alterações no roadmap por dependência técnica devem ser documentadas na seção **Histórico de alterações do roadmap**, preservando passos já concluídos.

---

Último passo concluído: PASSO 1
Próximo passo: PASSO 2

---

## Visão geral

- [x] PASSO 1 — Planejamento, arquitetura e estrutura inicial
- [ ] PASSO 2 — Docker e ambiente de desenvolvimento
- [ ] PASSO 3 — Banco MySQL, Prisma e Redis
- [ ] PASSO 4 — Backend base e padrões arquiteturais
- [ ] PASSO 5 — Frontend base e Design System
- [ ] PASSO 6 — Autenticação e usuários
- [ ] PASSO 7 — Organizações, equipes e RBAC
- [ ] PASSO 8 — Marcas e contexto da empresa
- [ ] PASSO 9 — Administração Master
- [ ] PASSO 10 — Arquitetura de provedores de IA
- [ ] PASSO 11 — OpenAI
- [ ] PASSO 12 — Claude
- [ ] PASSO 13 — Gemini
- [ ] PASSO 14 — OpenRouter
- [ ] PASSO 15 — OpenCode
- [ ] PASSO 16 — Failover, retry e Circuit Breaker
- [ ] PASSO 17 — Monitoramento e custos de IA
- [ ] PASSO 18 — Gerenciamento de prompts
- [ ] PASSO 19 — Motor de geração de conteúdo
- [ ] PASSO 20 — Biblioteca de conteúdo
- [ ] PASSO 21 — Campanhas
- [ ] PASSO 22 — Calendário editorial
- [ ] PASSO 23 — Scheduler e BullMQ
- [ ] PASSO 24 — Integrações de publicação
- [ ] PASSO 25 — Automações
- [ ] PASSO 26 — Analytics
- [ ] PASSO 27 — SEO
- [ ] PASSO 28 — Tendências e pesquisa autorizada
- [ ] PASSO 29 — Concorrentes
- [ ] PASSO 30 — Feedback loop da IA
- [ ] PASSO 31 — Notificações
- [ ] PASSO 32 — Auditoria e segurança
- [ ] PASSO 33 — Internacionalização
- [ ] PASSO 34 — Observabilidade
- [ ] PASSO 35 — Testes E2E
- [ ] PASSO 36 — Otimizações
- [ ] PASSO 37 — Hardening de segurança
- [ ] PASSO 38 — Documentação final
- [ ] PASSO 39 — Validação completa
- [ ] PASSO 40 — Preparação para produção

---

## Detalhamento dos passos

### PASSO 1 — Planejamento, arquitetura e estrutura inicial

- [x] Definir monorepo (`apps/api`, `apps/web`, `packages/config`, `packages/types`, `packages/shared`) — worker e scheduler como entrypoints de `apps/api` (ADR-003)
- [x] Definir gerenciador de pacotes e workspaces (pnpm 12 workspaces, Node 24)
- [x] Configurações compartilhadas de TypeScript (`@aom/config`), ESLint (flat config type-aware) e Prettier
- [x] `.gitignore`, `.gitattributes`, `.editorconfig`, `.nvmrc`, `.env.example` inicial
- [x] `README.md` inicial para desenvolvedores
- [x] Registrar decisões arquiteturais (ADRs resumidos) em `DOCUMENTACAO.md`
- [x] Pacotes `@aom/types` (contratos de domínio) e `@aom/shared` (`maskSecret`) com build dual ESM/CJS e testes
- [x] Validar format, lint, build, typecheck e testes da estrutura inicial

### PASSO 2 — Docker e ambiente de desenvolvimento

- [ ] `docker-compose.yml` com `frontend`, `backend`, `mysql`, `redis`, `worker`, `scheduler`
- [ ] Dockerfiles multi-stage (dev e prod) para api e web (`worker` e `scheduler` usam a imagem da api com outro comando)
- [ ] Volumes, redes e healthchecks dos containers
- [ ] Hot reload em desenvolvimento via Docker
- [ ] `nginx` (se necessário) como reverse proxy
- [ ] Validar `docker compose up -d` com todos os serviços saudáveis

### PASSO 3 — Banco MySQL, Prisma e Redis

- [ ] Configurar Prisma com MySQL 8
- [ ] Schema inicial (User, Organization, OrganizationMember, Role, Permission, AuditLog, FeatureFlag, SystemSetting)
- [ ] Convenções: UUID, timestamps, soft delete, índices, constraints
- [ ] Migrations e seeds (Super Admin, Organização Demo, Marca Demo, Campanha Demo — credenciais via env)
- [ ] Cliente Redis compartilhado (cache, locks distribuídos, rate limit)
- [ ] Testes de conexão e seeds

### PASSO 4 — Backend base e padrões arquiteturais

- [ ] Bootstrap NestJS modular
- [ ] Configuração tipada e validada de env
- [ ] Logger estruturado (JSON) com redaction de secrets
- [ ] Filters globais de erro, interceptors, pipes de validação
- [ ] Helmet, CORS restritivo, rate limiting
- [ ] Endpoints `/health`, `/health/live`, `/health/ready`
- [ ] Padrão de repositories/services, paginação e respostas
- [ ] Infraestrutura BullMQ básica (registro das filas)
- [ ] Testes Jest base

### PASSO 5 — Frontend base e Design System

- [ ] React + Vite + TypeScript + React Router + TanStack Query + Zustand
- [ ] Tailwind CSS + biblioteca de componentes acessíveis
- [ ] Tema Light/Dark/System com persistência
- [ ] Layout: sidebar, topbar, breadcrumbs, command palette, atalhos
- [ ] Componentes: toast, modal, drawer, skeleton, empty states, tabelas avançadas
- [ ] Estrutura i18n (pt/en/es) desde o início
- [ ] PWA-ready
- [ ] Testes Vitest + React Testing Library base

### PASSO 6 — Autenticação e usuários

- [ ] Registro, login, logout
- [ ] JWT access + refresh token com rotação
- [ ] Sessões e revogação
- [ ] Confirmação de e-mail, recuperação e alteração de senha
- [ ] Proteção contra brute force
- [ ] Arquitetura preparada para MFA
- [ ] Telas de autenticação no frontend
- [ ] Testes de autenticação

### PASSO 7 — Organizações, equipes e RBAC

- [ ] Organizações multi-tenant e membros
- [ ] Perfis SUPER_ADMIN, ADMIN, MANAGER, EDITOR, VIEWER
- [ ] Permissões granulares (`campaign.create`, `content.publish`, `ai.configure`, ...)
- [ ] Guards de permissão e escopo por organização
- [ ] Convites e gerenciamento de membros
- [ ] Testes de permissões

### PASSO 8 — Marcas e contexto da empresa

- [ ] Entidade Brand e Brand Profile
- [ ] Onboarding inteligente (empresa, público, persona, tom, concorrentes, palavras proibidas, CTA...)
- [ ] BrandMemory (contexto persistente)
- [ ] Telas de marca e onboarding
- [ ] Testes

### PASSO 9 — Administração Master

- [ ] Painel SUPER_ADMIN (usuários, organizações, marcas, sistema)
- [ ] Configurações do sistema e feature flags
- [ ] Visualização de filas/jobs e logs
- [ ] Testes

### PASSO 10 — Arquitetura de provedores de IA

- [ ] `AIProviderAdapter` (interface)
- [ ] `AIProviderManager` como ponto único de chamada
- [ ] Entidade AIProvider com configurações (key criptografada, base URL, modelos, timeout, retries, temperatura, tokens, prioridade, limites, RPM/TPM)
- [ ] Criptografia das API Keys e mascaramento (`••••••••abcd`)
- [ ] Tela de configuração + ordenação por drag-and-drop (salvamento imediato)
- [ ] Botão TESTAR CONEXÃO
- [ ] Auditoria obrigatória das alterações
- [ ] Testes

### PASSO 11 — OpenAI

- [ ] `OpenAIProvider` + listagem de modelos + health check + métricas + testes

### PASSO 12 — Claude

- [ ] `ClaudeProvider` + listagem de modelos + health check + métricas + testes

### PASSO 13 — Gemini

- [ ] `GeminiProvider` + listagem de modelos + health check + métricas + testes

### PASSO 14 — OpenRouter

- [ ] `OpenRouterProvider` (provider e gateway) + listagem de modelos + health check + testes

### PASSO 15 — OpenCode

- [ ] `OpenCodeProvider` (API Key, Base URL, provider/model) + health check + testes

### PASSO 16 — Failover, retry e Circuit Breaker

- [ ] Classificação de erros (transitórios vs permanentes de configuração)
- [ ] Failover por prioridade
- [ ] Circuit Breaker CLOSED/OPEN/HALF_OPEN com valores configuráveis (estado em Redis)
- [ ] Histórico de fallback por requisição
- [ ] Testes obrigatórios: OpenAI OFF → Claude; OpenAI+Claude OFF → Gemini; TODOS OFF → erro controlado + log + notificação

### PASSO 17 — Monitoramento e custos de IA

- [ ] Registro por requisição (provider, model, taskType, tokens, custo, latência, status, errorCode, fallbackCount)
- [ ] Dashboard de saúde (ONLINE/INSTÁVEL/OFFLINE)
- [ ] Dashboard de custos (hoje, 7d, 30d, mês, personalizado)
- [ ] Job AI_HEALTH_CHECK
- [ ] Limites mensais e alertas

### PASSO 18 — Gerenciamento de prompts

- [ ] Entidade PromptTemplate com versionamento
- [ ] Renderização de variáveis
- [ ] Tela de gerenciamento

### PASSO 19 — Motor de geração de conteúdo

- [ ] `AIContentEngine`
- [ ] Adaptação por canal (Instagram, LinkedIn, Facebook, X, TikTok, YouTube, Blog, Google Business)
- [ ] Anti-repetição
- [ ] Repurpose Content
- [ ] Bulk generation (7/15/30 dias) com preview
- [ ] Fila AI_GENERATION

### PASSO 20 — Biblioteca de conteúdo

- [ ] Ideias, drafts, publicados, arquivados, favoritos, templates
- [ ] Filtros (marca, canal, campanha, status, data, tipo, performance)
- [ ] Fluxo de aprovação (Draft → Review → Approved → Scheduled → Published)

### PASSO 21 — Campanhas

- [ ] CRUD de campanhas com objetivo, período, canais, audiência, frequência, temas, CTA, links
- [ ] UTM Builder
- [ ] Regras de IA por campanha
- [ ] Modo MANUAL / ASSISTIDO / AUTOMÁTICO

### PASSO 22 — Calendário editorial

- [ ] Views dia/semana/mês/lista
- [ ] Status IDEA → CANCELED
- [ ] Drag-and-drop
- [ ] Timezone da organização

### PASSO 23 — Scheduler e BullMQ

- [ ] Serviço scheduler dedicado
- [ ] Todas as filas (AI_GENERATION, CONTENT_PROCESSING, CONTENT_PUBLICATION, CONTENT_SCHEDULING, ANALYTICS_COLLECTION, AI_HEALTH_CHECK, NOTIFICATIONS, SEO_ANALYSIS, WEBHOOK_PROCESSING)
- [ ] Retry, backoff exponencial, DLQ, timeout, concorrência
- [ ] Idempotência e locks distribuídos (nunca publicar duas vezes)

### PASSO 24 — Integrações de publicação

- [ ] `PublisherAdapter` e implementações somente onde a API oficial permitir
- [ ] Contas sociais (OAuth) com tokens criptografados
- [ ] Fluxo assistido/manual (copiar, exportar, notificar) quando não houver publicação oficial

### PASSO 25 — Automações

- [ ] Motor TRIGGER → CONDITIONS → ACTIONS
- [ ] Triggers de tempo e de métricas
- [ ] Limites anti-spam

### PASSO 26 — Analytics

- [ ] Coleta via integrações (fila ANALYTICS_COLLECTION)
- [ ] Dashboard principal e métricas por conteúdo/campanha
- [ ] Somente métricas reais (nunca inventadas)

### PASSO 27 — SEO

- [ ] Palavras-chave, intenção, título, meta, headings, slug, links internos, score
- [ ] Geração de artigos para blog autorizado
- [ ] Fila SEO_ANALYSIS

### PASSO 28 — Tendências e pesquisa autorizada

- [ ] Fontes RSS/APIs/Google Trends (quando permitido)
- [ ] Sugestões de assuntos respeitando direitos autorais

### PASSO 29 — Concorrentes

- [ ] Cadastro e análise com fontes públicas permitidas
- [ ] Gaps de conteúdo e oportunidades

### PASSO 30 — Feedback loop da IA

- [ ] Insights de performance armazenados na BrandMemory
- [ ] Uso dos insights nas próximas gerações

### PASSO 31 — Notificações

- [ ] `NotificationService` (in-app, e-mail, webhook; preparado para Telegram/WhatsApp/push)
- [ ] Eventos (publicação, falhas, providers offline, limites de IA, automações)
- [ ] Webhooks de saída com assinatura, retry, logs, idempotência e replay

### PASSO 32 — Auditoria e segurança

- [ ] AuditLog completo (antes/depois, IP, userAgent)
- [ ] Tela de auditoria
- [ ] Proteção SSRF, validação de webhooks de entrada

### PASSO 33 — Internacionalização

- [ ] Traduções completas pt/en/es

### PASSO 34 — Observabilidade

- [ ] Métricas, traces e health de API, MySQL, Redis, workers, providers, filas, integrações

### PASSO 35 — Testes E2E

- [ ] Playwright cobrindo fluxos principais

### PASSO 36 — Otimizações

- [ ] Performance de queries, cache, bundle do frontend

### PASSO 37 — Hardening de segurança

- [ ] Revisão OWASP, dependências, headers, permissões

### PASSO 38 — Documentação final

- [ ] Revisão completa de `DOCUMENTACAO.md`, `README.md` e `CONTEXTO.md`

### PASSO 39 — Validação completa

- [ ] Lint, typecheck, testes unitários, integração, E2E e build de ponta a ponta

### PASSO 40 — Preparação para produção

- [ ] Builds de produção, pipeline CI (lint, typecheck, tests, build), backup/restauração, checklist de deploy (sem deploy sem autorização)

---

## Histórico de alterações do roadmap

- 2026-09-23 — Roadmap inicial criado a partir do `PROMPT.md` (seção 84). Nenhum passo iniciado.
- 2026-09-23 (PASSO 1) — Removido `apps/worker` da estrutura: worker e scheduler passam a ser entrypoints separados de `apps/api` (mesma base de código, containers distintos). Motivo: ambos dependem dos mesmos módulos de domínio (IA, publicações, Prisma); um app separado exigiria duplicar ou extrair esses módulos para pacotes. Ajustado o PASSO 2 (Dockerfiles para api e web). Ver ADR-003 em `DOCUMENTACAO.md`.
