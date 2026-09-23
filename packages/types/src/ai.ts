/** Provedores de IA suportados; cada um possui um adapter próprio no backend. */
export const AI_PROVIDERS = ['OPENAI', 'CLAUDE', 'GEMINI', 'OPENROUTER', 'OPENCODE'] as const;

export type AIProviderKey = (typeof AI_PROVIDERS)[number];

/**
 * Ordem inicial de prioridade para failover. Usada apenas no seed;
 * em execução, a prioridade vem da configuração salva pelo administrador.
 */
export const DEFAULT_AI_PROVIDER_PRIORITY: readonly AIProviderKey[] = [
  'OPENAI',
  'CLAUDE',
  'GEMINI',
  'OPENROUTER',
  'OPENCODE',
];

/** Estados do circuit breaker de cada provedor. */
export const CIRCUIT_STATES = ['CLOSED', 'OPEN', 'HALF_OPEN'] as const;

export type CircuitState = (typeof CIRCUIT_STATES)[number];
