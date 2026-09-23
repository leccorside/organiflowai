import { describe, expect, it } from 'vitest';
import {
  AI_PROVIDERS,
  AUTONOMY_MODES,
  CHANNEL_TYPES,
  CIRCUIT_STATES,
  CONTENT_STATUSES,
  DEFAULT_AI_PROVIDER_PRIORITY,
  FEATURE_FLAGS,
  ORGANIZATION_ROLES,
  QUEUE_NAMES,
  ROLES,
} from './index';

const hasDuplicates = (values: readonly string[]) => new Set(values).size !== values.length;

describe('@aom/types', () => {
  it.each([
    ['ROLES', ROLES],
    ['CONTENT_STATUSES', CONTENT_STATUSES],
    ['AUTONOMY_MODES', AUTONOMY_MODES],
    ['CHANNEL_TYPES', CHANNEL_TYPES],
    ['AI_PROVIDERS', AI_PROVIDERS],
    ['CIRCUIT_STATES', CIRCUIT_STATES],
    ['QUEUE_NAMES', Object.values(QUEUE_NAMES)],
    ['ORGANIZATION_ROLES', ORGANIZATION_ROLES],
    ['FEATURE_FLAGS', Object.values(FEATURE_FLAGS)],
  ])('%s não possui valores duplicados', (_name, values) => {
    expect(hasDuplicates(values)).toBe(false);
  });

  it('papéis de organização são todos os perfis exceto SUPER_ADMIN', () => {
    expect([...ORGANIZATION_ROLES]).toEqual(ROLES.filter((role) => role !== 'SUPER_ADMIN'));
  });

  it('chaves de feature flag são iguais aos valores', () => {
    for (const [key, value] of Object.entries(FEATURE_FLAGS)) {
      expect(value).toBe(key);
    }
  });

  it('prioridade padrão contém todos os provedores exatamente uma vez', () => {
    expect([...DEFAULT_AI_PROVIDER_PRIORITY].sort()).toEqual([...AI_PROVIDERS].sort());
  });

  it('nomes de fila são iguais às chaves (nome real no Redis)', () => {
    for (const [key, value] of Object.entries(QUEUE_NAMES)) {
      expect(value).toBe(key);
    }
  });

  it('nomes de fila não contêm ":" (proibido pelo BullMQ)', () => {
    for (const name of Object.values(QUEUE_NAMES)) {
      expect(name).not.toContain(':');
    }
  });
});
