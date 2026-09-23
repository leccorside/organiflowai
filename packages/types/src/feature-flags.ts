/** Chaves das feature flags globais (tabela `feature_flags`; criadas desabilitadas pelo seed). */
export const FEATURE_FLAGS = {
  ENABLE_AUTOPUBLISH: 'ENABLE_AUTOPUBLISH',
  ENABLE_AI_ROUTING: 'ENABLE_AI_ROUTING',
  ENABLE_TRENDS: 'ENABLE_TRENDS',
  ENABLE_COMPETITOR_ANALYSIS: 'ENABLE_COMPETITOR_ANALYSIS',
} as const;

export type FeatureFlagKey = (typeof FEATURE_FLAGS)[keyof typeof FEATURE_FLAGS];
