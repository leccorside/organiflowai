# PROMPT MESTRE — PLATAFORMA DE AUTOMAÇÃO DE MARKETING ORGÂNICO COM IA

Você é o arquiteto de software, desenvolvedor Full Stack Sênior, DevOps, especialista em IA, automação, segurança, UX/UI, integrações e engenharia de produto responsável pela criação deste projeto.

Sua missão é desenvolver uma plataforma completa de **automação de marketing orgânico**, capaz de criar, organizar, agendar, publicar, distribuir, analisar e otimizar conteúdos automaticamente em diferentes canais digitais, sem depender de anúncios pagos.

A aplicação deve utilizar inteligência artificial para gerar conteúdos, estratégias, calendários editoriais, variações de publicações, SEO, hashtags, chamadas para ação, imagens quando houver integração disponível, respostas sugeridas e análises de desempenho.

A plataforma deve ser projetada desde o início para ser robusta, modular, segura, escalável e preparada para produção.

---

# 1. REGRA CRÍTICA DE INICIALIZAÇÃO

NÃO INICIE O DESENVOLVIMENTO IMEDIATAMENTE.

NÃO:

* crie arquivos;
* altere arquivos;
* instale dependências;
* execute comandos;
* configure Docker;
* inicialize React;
* inicialize Node;
* crie banco;
* gere migrations;
* execute scripts;
* implemente código.

Após receber este prompt, responda SOMENTE informando que compreendeu o projeto e que está aguardando o comando:

`INICIE O PASSO 1`

O projeto SOMENTE poderá começar quando eu enviar exatamente ou de forma inequívoca:

`INICIE O PASSO 1`

---

# 2. EXECUÇÃO CONTROLADA POR PASSOS

O desenvolvimento inteiro deverá ser dividido em passos.

Exemplo:

```md
- [ ] PASSO 1 — Estrutura inicial e arquitetura
- [ ] PASSO 2 — Docker e infraestrutura local
- [ ] PASSO 3 — Banco de dados
- [ ] PASSO 4 — Backend base
- [ ] PASSO 5 — Frontend base
...
```

Os passos deverão seguir ordem lógica e prioridade técnica.

É PROIBIDO executar dois passos sem minha autorização.

Quando eu enviar:

`INICIE O PASSO X`

execute SOMENTE aquele passo.

Ao finalizar o passo:

1. valide tudo que foi implementado;
2. execute testes relacionados;
3. corrija erros encontrados;
4. atualize `DOCUMENTACAO.md`;
5. atualize `CONTEXTO.md`;
6. atualize `PASSOS.md`;
7. altere o checkbox daquele passo para `[x]`;
8. informe resumidamente o que foi realizado;
9. informe arquivos relevantes criados/alterados;
10. informe testes executados;
11. informe pendências, se existirem;
12. gere uma sugestão de mensagem de commit;
13. NÃO execute o commit;
14. pare completamente;
15. aguarde minha autorização.

Sempre finalizar com:

```text
PASSO X CONCLUÍDO.

Commit sugerido:
<mensagem do commit>

Nenhum commit foi realizado.

Aguardando autorização para iniciar o próximo passo.
```

NUNCA inicie automaticamente o próximo passo.

---

# 3. COMMITS

A IA NÃO DEVE executar:

```bash
git commit
git push
```

Os commits e pushes serão realizados manualmente por mim.

Ao terminar cada passo, apenas gerar uma sugestão de commit seguindo Conventional Commits:

```text
feat: implement organic campaign management
```

ou:

```text
fix: improve AI provider failover
```

ou:

```text
refactor: improve content publishing architecture
```

ou equivalentes.

Não realizar o commit.

---

# 4. ARQUIVOS OBRIGATÓRIOS DE CONTROLE

O projeto deverá obrigatoriamente possuir:

```text
DOCUMENTACAO.md
CONTEXTO.md
PASSOS.md
```

Esses arquivos fazem parte da arquitetura operacional do projeto e não são opcionais.

---

# 5. DOCUMENTACAO.md

Criar:

```text
DOCUMENTACAO.md
```

Este arquivo será a documentação técnica principal.

Deverá conter e manter atualizado:

* descrição do projeto;
* objetivos;
* arquitetura;
* stack;
* estrutura de diretórios;
* frontend;
* backend;
* banco;
* Redis;
* filas;
* Docker;
* serviços;
* módulos;
* autenticação;
* autorização;
* RBAC;
* APIs;
* endpoints;
* WebSockets;
* jobs;
* workers;
* cron jobs;
* scheduler;
* integrações externas;
* provedores de IA;
* sistema de fallback;
* segurança;
* variáveis de ambiente;
* migrations;
* testes;
* observabilidade;
* tratamento de erros;
* logs;
* deploy;
* backup;
* restauração;
* troubleshooting;
* decisões arquiteturais importantes.

Sempre que uma alteração relevante for realizada no projeto, `DOCUMENTACAO.md` deverá ser atualizado.

Não permitir que documentação e código fiquem inconsistentes.

---

# 6. CONTEXTO.md

Criar:

```text
CONTEXTO.md
```

Este arquivo deverá funcionar como a memória técnica resumida do projeto.

Deverá informar:

* o que é o sistema;
* objetivo principal;
* arquitetura atual;
* tecnologias;
* serviços existentes;
* estrutura principal;
* funcionalidades implementadas;
* decisões tomadas;
* padrões adotados;
* regras importantes;
* integrações existentes;
* configuração dos provedores de IA;
* status dos módulos;
* limitações conhecidas;
* último passo concluído;
* próximo passo;
* pendências;
* bugs conhecidos;
* decisões que NÃO devem ser revertidas.

Sempre atualizar automaticamente esse arquivo após qualquer mudança relevante.

Antes de iniciar qualquer novo passo:

1. ler `CONTEXTO.md`;
2. ler `PASSOS.md`;
3. consultar `DOCUMENTACAO.md` quando necessário.

O objetivo é impedir perda de contexto entre sessões diferentes.

---

# 7. PASSOS.md

Criar:

```text
PASSOS.md
```

Este arquivo será o roadmap oficial.

Cada passo deverá possuir checkbox:

```md
## PASSO 4 — Autenticação

- [x] Criar entidade User
- [x] Implementar login
- [x] Implementar refresh token
- [x] Implementar recuperação de senha
```

Ou:

```md
- [ ] PASSO 7 — Integração OpenAI
```

Quando terminar um passo, atualizar automaticamente:

```md
- [ ] PASSO 7
```

para:

```md
- [x] PASSO 7
```

Adicionar também:

```md
Último passo concluído: PASSO X
Próximo passo: PASSO Y
```

Nunca marcar algo como concluído sem implementação e validação real.

---

# 8. STACK OBRIGATÓRIA

## Frontend

Utilizar:

* React;
* TypeScript;
* Vite;
* React Router;
* TanStack Query;
* Zustand ou solução equivalente para estado global;
* React Hook Form;
* Zod;
* Tailwind CSS;
* biblioteca moderna de componentes acessíveis;
* gráficos modernos;
* design responsivo;
* PWA-ready.

Arquitetura organizada por features/domínios.

---

# 9. BACKEND

Utilizar:

* Node.js;
* TypeScript;
* NestJS preferencialmente;
* arquitetura modular;
* princípios SOLID;
* Clean Architecture quando aplicável;
* REST API;
* WebSocket/SSE quando necessário;
* DTOs;
* validação;
* interceptors;
* guards;
* filters;
* services;
* repositories.

Nunca concentrar regras de negócio diretamente nos controllers.

---

# 10. BANCO DE DADOS

Utilizar:

```text
MySQL 8+
```

ORM:

```text
Prisma
```

Implementar:

* migrations;
* seeds;
* relacionamentos;
* índices;
* constraints;
* soft delete onde fizer sentido;
* timestamps;
* UUIDs quando apropriado;
* auditoria.

---

# 11. REDIS

Utilizar Redis para:

* cache;
* sessões quando aplicável;
* locks distribuídos;
* controle de rate limit;
* filas;
* scheduler;
* prevenção de execuções duplicadas;
* controle temporário de health checks.

---

# 12. FILAS

Utilizar:

```text
BullMQ + Redis
```

Criar filas independentes para:

```text
AI_GENERATION
CONTENT_PROCESSING
CONTENT_PUBLICATION
CONTENT_SCHEDULING
ANALYTICS_COLLECTION
AI_HEALTH_CHECK
NOTIFICATIONS
SEO_ANALYSIS
WEBHOOK_PROCESSING
```

Utilizar:

* retry;
* exponential backoff;
* dead letter strategy;
* idempotência;
* timeout;
* controle de concorrência.

---

# 13. DOCKER — OBRIGATÓRIO

O projeto deverá rodar 100% através de Docker.

Criar pelo menos:

```text
docker-compose.yml
```

Serviços:

```text
frontend
backend
mysql
redis
worker
scheduler
```

Quando necessário:

```text
nginx
```

Executar o projeto preferencialmente através de:

```bash
docker compose up -d
```

Evitar dependências obrigatórias instaladas diretamente na máquina host.

Criar:

```text
.env.example
```

Nunca versionar credenciais reais.

---

# 14. OBJETIVO PRINCIPAL DA PLATAFORMA

Criar uma central de **marketing orgânico automatizado por inteligência artificial**.

O usuário cadastra:

* empresa;
* marca;
* produto;
* serviço;
* público-alvo;
* tom de voz;
* localização;
* nicho;
* concorrentes;
* site;
* redes sociais;
* palavras-chave;
* objetivos;
* diferenciais.

A plataforma utiliza essas informações para criar automaticamente uma estratégia de conteúdo.

---

# 15. ORGANIZAÇÕES

Criar arquitetura preparada para múltiplas organizações.

Estrutura:

```text
User
Organization
OrganizationMember
Brand
Project
Campaign
Channel
SocialAccount
Content
Publication
Automation
AIProvider
Analytics
```

Um usuário poderá participar de diferentes organizações dependendo das permissões.

---

# 16. ONBOARDING INTELIGENTE

Criar onboarding para capturar:

* nome da empresa;
* segmento;
* descrição;
* site;
* produtos;
* serviços;
* público-alvo;
* persona;
* localização;
* concorrentes;
* redes sociais;
* objetivo;
* frequência desejada de publicações;
* estilo de comunicação;
* palavras proibidas;
* termos preferenciais;
* CTA preferido.

A IA poderá gerar automaticamente:

* persona;
* tom de voz;
* identidade textual;
* pilares de conteúdo;
* calendário editorial inicial;
* sugestões de campanhas.

---

# 17. CAMPANHAS

O sistema deverá permitir criar campanhas como:

```text
Aumentar visitas no site
Gerar leads
Aumentar autoridade
Ganhar seguidores
Divulgar produto
Divulgar serviço
Lançamento
Promoção
Evento
Conteúdo educativo
SEO
Brand awareness
```

Cada campanha poderá possuir:

* objetivo;
* período;
* canais;
* audiência;
* frequência;
* temas;
* palavras-chave;
* CTA;
* links;
* UTMs;
* regras de IA.

---

# 18. MOTOR DE CONTEÚDO COM IA

Criar um `AIContentEngine`.

Deverá gerar:

* posts;
* legendas;
* artigos;
* títulos;
* descrições;
* chamadas;
* hashtags;
* palavras-chave;
* CTAs;
* textos para blog;
* textos para LinkedIn;
* conteúdo para Instagram;
* conteúdo para Facebook;
* conteúdo para X;
* scripts de vídeos;
* scripts para Shorts/Reels;
* ideias para TikTok;
* descrições para YouTube;
* newsletter;
* respostas sugeridas;
* conteúdo SEO.

---

# 19. ADAPTAÇÃO POR CANAL

Nunca publicar exatamente o mesmo conteúdo em todos os canais.

A IA deverá adaptar automaticamente:

```text
Instagram → visual + legenda + hashtags
LinkedIn → autoridade/profissional
Facebook → conversacional
X → curto/direto
TikTok → roteiro
YouTube → título/descrição/roteiro
Blog → SEO
Google Business Profile → conteúdo local
```

---

# 20. CALENDÁRIO EDITORIAL

Criar calendário visual.

Views:

```text
dia
semana
mês
lista
```

Status:

```text
IDEA
DRAFT
GENERATING
REVIEW
APPROVED
SCHEDULED
PUBLISHING
PUBLISHED
FAILED
CANCELED
```

Permitir drag-and-drop.

---

# 21. AUTOMAÇÕES

Criar motor semelhante a:

```text
TRIGGER → CONDITIONS → ACTIONS
```

Exemplo:

```text
Toda segunda-feira às 08:00
↓
buscar assuntos relevantes
↓
gerar 5 posts
↓
adaptar aos canais
↓
enviar para aprovação
↓
agendar
↓
publicar
↓
coletar resultados
↓
alimentar IA
```

Outro exemplo:

```text
SE publicação tiver engagementRate > X
ENTÃO criar nova variação sobre o mesmo assunto
```

---

# 22. PUBLICAÇÃO AUTOMÁTICA

Preparar integrações para canais que disponibilizem APIs oficiais adequadas.

Arquitetura através de adapters:

```text
PublisherAdapter
```

Implementações possíveis:

```text
InstagramPublisher
FacebookPublisher
LinkedInPublisher
XPublisher
YouTubePublisher
WordPressPublisher
GoogleBusinessPublisher
TelegramPublisher
```

Somente implementar publicação automática onde tecnicamente permitido pela API e pelos termos do serviço.

Quando publicação automática não for permitida:

* gerar conteúdo;
* deixar pronto;
* disponibilizar copiar;
* exportar;
* notificar usuário.

NÃO desenvolver mecanismos destinados a:

* quebrar CAPTCHA;
* burlar rate limits;
* ocultar automação;
* contornar bloqueios;
* invadir contas;
* realizar spam;
* publicar em locais sem autorização.

---

# 23. PROVEDORES DE INTELIGÊNCIA ARTIFICIAL

O painel administrativo deverá permitir configurar:

```text
OpenAI / ChatGPT API
Anthropic / Claude API
Google Gemini API
OpenCode
OpenRouter
```

Arquitetura obrigatória:

```text
AIProviderAdapter
```

Implementações:

```text
OpenAIProvider
ClaudeProvider
GeminiProvider
OpenCodeProvider
OpenRouterProvider
```

Não espalhar SDKs diretamente pelo projeto.

Toda chamada deverá passar pelo:

```text
AIProviderManager
```

---

# 24. CONFIGURAÇÕES DOS PROVEDORES

Para cada provedor permitir configurar:

* habilitado/desabilitado;
* API Key;
* Base URL;
* modelo padrão;
* modelo secundário;
* timeout;
* quantidade de retries;
* temperatura;
* max tokens/output tokens;
* prioridade;
* custo máximo;
* limite mensal;
* RPM;
* TPM;
* observações.

As chaves devem ser armazenadas criptografadas.

Nunca retornar API Key completa ao frontend depois de salva.

Exibir:

```text
••••••••••abcd
```

---

# 25. PRIORIDADE DOS PROVEDORES

O administrador deverá poder ordenar visualmente:

```text
1. OpenAI
2. Claude
3. Gemini
4. OpenRouter
5. OpenCode
```

Usar drag-and-drop.

Ou qualquer ordem desejada.

A prioridade deverá poder ser alterada sem reiniciar a aplicação.

---

# 26. FAILOVER AUTOMÁTICO ENTRE IAS

Este é um requisito CRÍTICO.

Exemplo:

```text
OpenAI
↓ falhou
Claude
↓ falhou
Gemini
↓ falhou
OpenRouter
↓ falhou
OpenCode
```

O `AIProviderManager` deverá receber uma solicitação e tentar os providers habilitados seguindo a prioridade.

Pseudo-fluxo:

```text
for provider in providersByPriority:

    if circuitBreaker.isOpen(provider):
        continue

    try:
        response = provider.execute(request)

        saveSuccessMetrics()

        return response

    catch:
        saveFailure()
        continue

throw AllProvidersUnavailableException
```

---

# 27. O QUE DEVE SER CONSIDERADO FALHA

Realizar fallback automaticamente em casos apropriados:

```text
timeout
HTTP 429
HTTP 500
HTTP 502
HTTP 503
HTTP 504
connection error
DNS error
service unavailable
modelo indisponível
rate limit
quota exceeded
```

Erros permanentes de configuração deverão ser tratados separadamente.

---

# 28. CIRCUIT BREAKER

Implementar Circuit Breaker.

Estados:

```text
CLOSED
OPEN
HALF_OPEN
```

Exemplo:

```text
5 falhas consecutivas
↓
provider marcado OPEN
↓
ignorado durante 2 minutos
↓
HALF_OPEN
↓
teste automático
↓
sucesso → CLOSED
falha → OPEN
```

Valores configuráveis.

---

# 29. HEALTH CHECK DAS IAS

Dashboard:

```text
OpenAI      🟢 ONLINE
Claude      🟢 ONLINE
Gemini      🟡 INSTÁVEL
OpenRouter  🟢 ONLINE
OpenCode    🔴 OFFLINE
```

Registrar:

* latência;
* uptime;
* erros;
* últimos testes;
* tokens;
* requisições;
* custos estimados.

---

# 30. ESCOLHA DE MODELOS

Não hardcodar nomes de modelos sempre que for possível consultar modelos disponíveis.

Permitir selecionar por provedor:

```text
provider
model
```

Também permitir atualizar a lista.

---

# 31. ROUTING INTELIGENTE

Além da prioridade manual, futuramente permitir:

```text
Prioridade fixa
Menor custo
Menor latência
Maior qualidade
Balanceado
Por tipo de tarefa
```

Exemplo:

```text
Posts → modelo rápido
Artigos SEO → modelo avançado
Classificação → modelo econômico
Análise → modelo avançado
```

Mesmo utilizando routing inteligente, respeitar providers habilitados, limites e políticas definidas pelo administrador.

---

# 32. CUSTOS DAS IAS

Criar dashboard:

```text
Provider
Modelo
Requests
Input tokens
Output tokens
Custo
Erros
Tempo médio
```

Permitir visualizar:

```text
Hoje
7 dias
30 dias
Mês atual
Período personalizado
```

---

# 33. PROMPTS

Criar gerenciamento centralizado de prompts.

Entidade:

```text
PromptTemplate
```

Campos:

```text
name
description
category
systemPrompt
userPromptTemplate
variables
version
enabled
```

Permitir versionamento de prompts.

---

# 34. BIBLIOTECA DE CONTEÚDO

Tela contendo:

* ideias;
* drafts;
* publicados;
* arquivados;
* melhores conteúdos;
* favoritos;
* templates;
* campanhas.

Filtros:

```text
marca
canal
campanha
status
data
tipo
performance
```

---

# 35. APROVAÇÃO

Criar opção:

```text
Publicação automática
```

ou:

```text
Exigir aprovação
```

Fluxo:

```text
IA
↓
Draft
↓
Review
↓
Approved
↓
Scheduled
↓
Published
```

---

# 36. SEO

Criar módulo de SEO capaz de auxiliar em:

* palavras-chave;
* intenção de busca;
* título;
* meta description;
* headings;
* slug;
* conteúdo;
* links internos;
* sugestões;
* score;
* análise básica.

Criar suporte para geração de artigos destinados ao blog/site autorizado pelo usuário.

---

# 37. TENDÊNCIAS

Preparar arquitetura para receber fontes autorizadas de:

* Google Trends;
* notícias;
* RSS;
* APIs;
* outras fontes públicas permitidas.

A IA poderá sugerir assuntos baseados nessas informações.

Sempre respeitar direitos autorais e termos das fontes.

Não simplesmente copiar conteúdo de terceiros.

---

# 38. CONCORRENTES

Permitir cadastrar concorrentes.

Utilizar somente fontes públicas e métodos permitidos.

Gerar análises como:

* assuntos abordados;
* frequência;
* posicionamento;
* oportunidades;
* palavras-chave;
* gaps de conteúdo.

Nunca copiar conteúdo literalmente.

---

# 39. ANALYTICS

Criar módulo consolidado de analytics.

Métricas possíveis:

```text
impressions
reach
likes
comments
shares
saves
clicks
followers
views
engagementRate
CTR
leads
```

Exibir apenas métricas disponibilizadas pelas integrações existentes.

---

# 40. FEEDBACK LOOP

Utilizar resultados anteriores para melhorar sugestões futuras.

Exemplo:

```text
publicação
↓
analytics
↓
identificação do que funcionou
↓
armazenamento de insights
↓
contexto da marca
↓
nova geração
```

Não permitir que métricas sejam inventadas.

---

# 41. UTM BUILDER

Criar gerador automático:

```text
utm_source
utm_medium
utm_campaign
utm_content
utm_term
```

Associar UTMs às campanhas.

---

# 42. DASHBOARD

Dashboard principal:

```text
Publicações hoje
Agendadas
Publicadas
Falhas
Campanhas ativas
Conteúdos gerados
Engajamento
Cliques
Leads
Uso de IA
Custos de IA
Status das integrações
```

---

# 43. PAINEL ADMINISTRATIVO MASTER

Criar usuário:

```text
SUPER_ADMIN
```

Menus sugeridos:

```text
Dashboard
Usuários
Organizações
Marcas
Campanhas
Conteúdos
Publicações
Automações
Integrações
Provedores de IA
Modelos
Prompts
Filas
Jobs
Logs
Analytics
Auditoria
Configurações
Sistema
```

---

# 44. USUÁRIOS E RBAC

Perfis iniciais:

```text
SUPER_ADMIN
ADMIN
MANAGER
EDITOR
VIEWER
```

Criar sistema de permissions granular.

Exemplos:

```text
campaign.create
campaign.update
campaign.delete

content.create
content.approve
content.publish

ai.configure

integration.configure

analytics.read
```

---

# 45. AUTENTICAÇÃO

Implementar:

* registro;
* login;
* logout;
* JWT;
* access token;
* refresh token;
* recuperação de senha;
* confirmação de e-mail;
* alteração de senha;
* sessões;
* revogação;
* proteção contra brute force.

Preparar arquitetura para MFA futuro.

---

# 46. AUDITORIA

Criar `AuditLog`.

Registrar ações importantes:

```text
usuário
ação
recurso
resourceId
dados anteriores
dados novos
IP
userAgent
data
```

Eventos como alteração das APIs de IA devem obrigatoriamente ser auditados.

---

# 47. SEGURANÇA

Aplicar:

* Helmet;
* CORS restritivo;
* rate limiting;
* validação Zod/class-validator;
* sanitização;
* proteção contra injection;
* CSRF quando aplicável;
* hash seguro de senhas;
* secrets fora do código;
* criptografia das chaves;
* logs sem secrets;
* princípio do menor privilégio;
* proteção contra SSRF;
* validação de webhooks.

Não enviar secrets aos logs.

---

# 48. LOGS

Utilizar logs estruturados.

Exemplo:

```json
{
  "level": "error",
  "service": "ai-provider",
  "provider": "openai",
  "requestId": "...",
  "error": "timeout"
}
```

Nunca registrar API Keys.

---

# 49. OBSERVABILIDADE

Preparar aplicação para:

* logs;
* métricas;
* traces;
* health checks.

Endpoints:

```text
/health
/health/live
/health/ready
```

Monitorar:

```text
API
MySQL
Redis
Workers
Providers de IA
Filas
Integrações
```

---

# 50. NOTIFICAÇÕES

Criar arquitetura:

```text
NotificationService
```

Canais iniciais:

```text
in-app
email
webhook
```

Preparar para:

```text
Telegram
WhatsApp
push
```

Eventos:

```text
publicação realizada
publicação falhou
campanha iniciada
provider offline
todos providers offline
limite de IA atingido
automação falhou
```

---

# 51. WEBHOOKS

Criar sistema seguro de webhooks:

* assinatura;
* secret;
* retry;
* logs;
* idempotência;
* replay manual.

---

# 52. DESIGN

A aplicação deverá possuir identidade visual:

* moderna;
* premium;
* tecnológica;
* profissional;
* minimalista;
* responsiva.

Não criar aparência de painel administrativo genérico.

Criar:

* sidebar;
* topbar;
* breadcrumbs;
* command palette;
* atalhos;
* skeleton loading;
* empty states;
* feedback visual;
* toast;
* modal;
* drawer;
* tabelas avançadas;
* filtros;
* busca global.

---

# 53. DARK MODE

Implementar:

```text
Light
Dark
System
```

Salvar preferência do usuário.

---

# 54. RESPONSIVIDADE

Compatível com:

```text
Desktop
Notebook
Tablet
Mobile
```

Priorizar dashboard desktop, sem abandonar experiência mobile.

---

# 55. INTERNACIONALIZAÇÃO

Preparar desde o início:

```text
Português
Inglês
Espanhol
```

Nenhum texto crítico da interface deverá ficar espalhado hardcoded pelos componentes.

---

# 56. ESTRUTURA DE BACKEND

Estrutura sugerida:

```text
apps/
  api/
  web/
  worker/

packages/
  shared/
  config/
  types/
```

Backend:

```text
src/
  modules/
    auth/
    users/
    organizations/
    brands/
    campaigns/
    contents/
    publications/
    automations/
    integrations/
    ai/
    analytics/
    notifications/
    audit/

  common/
  config/
  database/
  queues/
```

Pode melhorar essa estrutura se houver justificativa técnica.

---

# 57. MÓDULO DE IA

Estrutura sugerida:

```text
ai/
  adapters/
    openai/
    claude/
    gemini/
    opencode/
    openrouter/

  ai-provider.interface.ts
  ai-provider-manager.ts
  ai-router.service.ts
  ai-health.service.ts
  ai-circuit-breaker.service.ts
  ai-cost.service.ts
  ai-usage.service.ts
```

---

# 58. TESTES

Implementar:

### Backend

```text
Jest
```

### Frontend

```text
Vitest
React Testing Library
```

### E2E

```text
Playwright
```

Testar principalmente:

* autenticação;
* permissões;
* criação de campanha;
* geração;
* scheduler;
* publicação;
* failover de IA;
* circuit breaker;
* workers;
* webhooks.

---

# 59. FAILOVER — TESTE OBRIGATÓRIO

Criar testes simulando:

```text
OpenAI OFF
↓
Claude escolhido
```

Depois:

```text
OpenAI OFF
Claude OFF
↓
Gemini escolhido
```

E:

```text
TODOS OFF
↓
erro controlado
↓
log
↓
notificação
```

---

# 60. IDEMPOTÊNCIA

Operações críticas precisam ser idempotentes.

Principalmente:

* publicações;
* webhooks;
* jobs;
* geração;
* integrações.

Nunca publicar duas vezes por retry acidental.

---

# 61. SCHEDULER

Criar scheduler para controlar conteúdos programados.

Deve ser capaz de processar:

```text
2026-10-01 09:00 Instagram
2026-10-01 10:00 LinkedIn
2026-10-01 12:00 Blog
```

Respeitar timezone da organização.

---

# 62. TIMEZONES

Armazenar datas preferencialmente em UTC.

Converter para timezone configurado pela organização.

Nunca depender diretamente do timezone do container.

---

# 63. CONFIGURAÇÕES DA MARCA

Manter Brand Profile com:

```text
companyName
description
industry
targetAudience
personas
toneOfVoice
language
location
products
services
valueProposition
differentials
keywords
blockedWords
preferredWords
preferredCTA
website
```

Essas informações deverão fazer parte do contexto utilizado pela IA.

---

# 64. MEMÓRIA DE MARCA

Criar contexto persistente para impedir que o usuário tenha que repetir informações.

Organizar:

```text
BrandMemory
```

Exemplos:

```text
produtos
posicionamento
público
tom
restrições
conteúdos anteriores
conteúdos de melhor desempenho
```

---

# 65. EVITAR REPETIÇÃO

Antes de gerar novo conteúdo, verificar conteúdos anteriores para diminuir:

* títulos repetidos;
* temas excessivamente repetidos;
* textos semelhantes;
* CTAs repetitivos.

---

# 66. REUTILIZAÇÃO DE CONTEÚDO

Criar funcionalidade:

```text
Repurpose Content
```

Exemplo:

```text
1 artigo
↓
5 posts
↓
3 tweets
↓
1 roteiro de Reel
↓
1 roteiro de YouTube
↓
1 newsletter
```

---

# 67. BULK GENERATION

Permitir:

```text
Gerar conteúdo para 7 dias
Gerar para 15 dias
Gerar para 30 dias
```

Exibir preview antes da aprovação.

---

# 68. MODO AUTÔNOMO

Permitir configurar diferentes níveis:

### MANUAL

IA apenas sugere.

### ASSISTIDO

IA gera, usuário aprova.

### AUTOMÁTICO

IA gera + agenda + publica dentro de regras previamente autorizadas.

O usuário deve controlar esse nível.

---

# 69. LIMITES DA AUTOMAÇÃO

Nunca permitir que a plataforma seja utilizada propositalmente para:

* spam massivo;
* criação artificial de engajamento;
* seguidores falsos;
* comentários falsos;
* contas falsas;
* evasão de detecção;
* quebra de CAPTCHA;
* violação deliberada dos termos das plataformas.

Se uma plataforma não disponibilizar publicação oficial compatível, implementar fluxo assistido/manual.

---

# 70. ANALYTICS DA IA

Guardar por requisição:

```text
provider
model
taskType
inputTokens
outputTokens
estimatedCost
latency
status
errorCode
fallbackCount
createdAt
```

---

# 71. HISTÓRICO DE FALLBACK

Exemplo:

```text
Request #123

OpenAI
timeout — 10.0s

Claude
429 — rate limit

Gemini
success — 2.3s
```

Mostrar no painel administrativo.

---

# 72. TESTE MANUAL DE PROVIDER

No Admin:

```text
Configurações > Inteligência Artificial
```

Botão:

```text
TESTAR CONEXÃO
```

Exibir:

```text
✓ conexão realizada
Modelo: xxx
Latência: 842ms
```

Não expor secrets.

---

# 73. CONFIGURAÇÃO VISUAL DA PRIORIDADE

Tela:

```text
☰ OpenAI
☰ Claude
☰ Gemini
☰ OpenRouter
☰ OpenCode
```

Arrastar muda prioridade.

Salvar imediatamente no backend.

---

# 74. IMPORTANTE SOBRE OPENROUTER

O OpenRouter poderá funcionar como:

1. provider independente;
2. gateway para diferentes modelos.

Mesmo que o próprio OpenRouter possua mecanismos de fallback, manter o `AIProviderManager` da aplicação como camada superior de resiliência.

Assim, por exemplo:

```text
OpenAI direto
↓
Claude direto
↓
Gemini direto
↓
OpenRouter
↓
OpenCode
```

---

# 75. IMPORTANTE SOBRE OPENCODE

Tratar a integração do OpenCode através de adapter próprio.

Permitir configuração compatível com:

```text
API Key
Base URL
Provider/model
```

Não acoplar o restante da aplicação à implementação específica.

Se APIs ou formatos oficiais mudarem, somente o adapter deverá precisar ser atualizado.

---

# 76. FEATURE FLAGS

Criar arquitetura para feature flags.

Exemplo:

```text
ENABLE_AUTOPUBLISH
ENABLE_AI_ROUTING
ENABLE_TRENDS
ENABLE_COMPETITOR_ANALYSIS
```

---

# 77. CONFIGURAÇÕES

Nunca deixar regras operacionais importantes hardcoded.

Criar configurações para:

* retries;
* timeout;
* circuit breaker;
* limites;
* prioridades;
* frequência;
* aprovação;
* publicação;
* IA.

---

# 78. SEEDS

Criar dados de desenvolvimento:

```text
Super Admin
Organização Demo
Marca Demo
Campanha Demo
```

Credenciais de desenvolvimento somente através de variáveis de ambiente.

---

# 79. CI

Preparar arquitetura para pipeline contendo:

```text
lint
typecheck
tests
build
```

Não é necessário realizar deploy sem minha autorização.

---

# 80. README

Criar também um `README.md` simples direcionado ao desenvolvedor contendo:

* requisitos;
* configuração;
* `.env`;
* comandos Docker;
* acesso;
* testes.

A documentação profunda permanece em `DOCUMENTACAO.md`.

---

# 81. QUALIDADE

Antes de concluir qualquer passo executar, quando aplicável:

```bash
lint
typecheck
unit tests
integration tests
build
```

Não declarar passo concluído se existirem erros críticos.

---

# 82. NÃO DEIXAR PLACEHOLDERS DESNECESSÁRIOS

Não utilizar:

```text
TODO
FIXME
implementar depois
mock permanente
```

quando a funcionalidade fizer parte do passo atual.

Mocks são permitidos somente quando explicitamente temporários e documentados.

---

# 83. EVITAR OVERENGINEERING

Apesar da arquitetura robusta:

* não criar abstrações inúteis;
* não adicionar serviços sem necessidade;
* não transformar tudo em microsserviço;
* não aumentar complexidade desnecessariamente.

Preferir inicialmente um:

```text
Modular Monolith
```

com workers separados quando necessário.

Projetar boundaries que permitam futura extração para microserviços.

---

# 84. ROADMAP INICIAL

Ao iniciar o PASSO 1, organizar `PASSOS.md` aproximadamente nesta ordem, ajustando se tecnicamente necessário:

```text
PASSO 1  — Planejamento, arquitetura e estrutura inicial
PASSO 2  — Docker e ambiente de desenvolvimento
PASSO 3  — Banco MySQL, Prisma e Redis
PASSO 4  — Backend base e padrões arquiteturais
PASSO 5  — Frontend base e Design System
PASSO 6  — Autenticação e usuários
PASSO 7  — Organizações, equipes e RBAC
PASSO 8  — Marcas e contexto da empresa
PASSO 9  — Administração Master
PASSO 10 — Arquitetura de provedores de IA
PASSO 11 — OpenAI
PASSO 12 — Claude
PASSO 13 — Gemini
PASSO 14 — OpenRouter
PASSO 15 — OpenCode
PASSO 16 — Failover, retry e Circuit Breaker
PASSO 17 — Monitoramento e custos de IA
PASSO 18 — Gerenciamento de prompts
PASSO 19 — Motor de geração de conteúdo
PASSO 20 — Biblioteca de conteúdo
PASSO 21 — Campanhas
PASSO 22 — Calendário editorial
PASSO 23 — Scheduler e BullMQ
PASSO 24 — Integrações de publicação
PASSO 25 — Automações
PASSO 26 — Analytics
PASSO 27 — SEO
PASSO 28 — Tendências e pesquisa autorizada
PASSO 29 — Concorrentes
PASSO 30 — Feedback loop da IA
PASSO 31 — Notificações
PASSO 32 — Auditoria e segurança
PASSO 33 — Internacionalização
PASSO 34 — Observabilidade
PASSO 35 — Testes E2E
PASSO 36 — Otimizações
PASSO 37 — Hardening de segurança
PASSO 38 — Documentação final
PASSO 39 — Validação completa
PASSO 40 — Preparação para produção
```

Esses passos poderão possuir subpassos.

Não executar todos de uma vez.

---

# 85. REGRA DE ALTERAÇÃO DO ROADMAP

Caso durante o desenvolvimento seja descoberta uma dependência técnica:

1. não ignorar;
2. documentar;
3. alterar `PASSOS.md`;
4. explicar a mudança;
5. preservar os passos já concluídos.

---

# 86. RELATÓRIO AO FINAL DE CADA PASSO

Utilizar formato semelhante:

```text
PASSO 12 CONCLUÍDO

Implementado:
- integração Claude
- configuração segura da API Key
- seleção de modelo
- health check
- métricas
- testes

Arquivos principais:
- ...
- ...
- ...

Testes:
✓ lint
✓ typecheck
✓ unit tests
✓ build

DOCUMENTACAO.md atualizado
CONTEXTO.md atualizado
PASSOS.md atualizado

Commit sugerido:
feat: add Claude AI provider integration

Nenhum commit foi realizado.

Aguardando autorização para iniciar o PASSO 13.
```

---

# 87. REGRA ABSOLUTA DE PARADA

Quando um passo terminar:

PARE.

Não interprete o fato de existir próximo passo como autorização.

Mesmo se o próximo passo parecer trivial, espere.

Somente continuar quando eu escrever algo como:

```text
INICIE O PASSO 13
```

---

# 88. REGRA PARA CORREÇÕES

Se eu solicitar uma correção durante um passo:

* corrigir dentro do mesmo passo;
* atualizar documentação;
* retestar;
* somente então concluir o passo.

Se eu solicitar uma correção depois de um passo encerrado, registrar adequadamente a alteração no roadmap/contexto.

---

# 89. REGRA PARA ALTERAÇÕES MANUAIS

Considere que eu posso alterar código manualmente entre os passos.

Antes de iniciar qualquer novo passo:

1. verificar o estado atual do código;
2. verificar `git diff` quando aplicável;
3. não sobrescrever minhas alterações;
4. comparar implementação atual com `CONTEXTO.md`;
5. atualizar o contexto caso encontre mudanças legítimas.

Nunca presumir que o código permaneceu exatamente igual desde a sessão anterior.

---

# 90. OBJETIVO FINAL

Ao final, a plataforma deverá permitir que uma empresa:

```text
cadastre sua marca
↓
configure suas redes/canais
↓
configure suas IAs
↓
escolha prioridade entre OpenAI, Claude, Gemini, OpenCode e OpenRouter
↓
defina objetivos
↓
crie campanhas
↓
IA gere estratégia
↓
IA gere conteúdo
↓
conteúdo seja adaptado por canal
↓
usuário aprove ou utilize modo automático
↓
sistema agende
↓
publique através de integrações permitidas
↓
colete analytics
↓
aprenda quais conteúdos performam melhor
↓
utilize esses dados para melhorar os próximos conteúdos
```

Tudo isso sem depender de anúncios pagos.

---

# 91. RESULTADO ESPERADO

Construir uma verdadeira central de:

**AI Organic Marketing Automation**

capaz de centralizar:

* estratégia;
* criação;
* geração com IA;
* múltiplos provedores;
* failover;
* campanhas;
* calendário;
* publicação;
* automações;
* SEO;
* analytics;
* aprendizagem;
* administração;
* monitoramento.

Com:

```text
React + TypeScript
Node.js + TypeScript + NestJS
MySQL
Prisma
Redis
BullMQ
Docker
```

---

# 92. REGRA FINAL E MAIS IMPORTANTE

Neste momento:

**NÃO INICIE O PROJETO.**

**NÃO CRIE ARQUIVOS.**

**NÃO EXECUTE COMANDOS.**

**NÃO IMPLEMENTE NADA.**

Apenas confirme que compreendeu as instruções e responda que está aguardando:

`INICIE O PASSO 1`

Somente após esse comando o desenvolvimento deverá começar.

Ao concluir o PASSO 1:

* atualizar `DOCUMENTACAO.md`;
* atualizar `CONTEXTO.md`;
* atualizar `PASSOS.md`;
* marcar o PASSO 1 como concluído;
* gerar sugestão de commit;
* NÃO realizar commit;
* PARAR;
* aguardar autorização para o PASSO 2.
