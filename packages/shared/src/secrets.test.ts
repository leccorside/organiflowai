import { describe, expect, it } from 'vitest';
import { maskSecret } from './secrets';

describe('maskSecret', () => {
  it('exibe apenas os 4 últimos caracteres com máscara de tamanho fixo', () => {
    expect(maskSecret('sk-proj-1234567890abcd')).toBe('••••••••••abcd');
  });

  it('não revela o comprimento real do segredo', () => {
    expect(maskSecret('a'.repeat(20) + 'wxyz')).toHaveLength(
      maskSecret('b'.repeat(80) + 'wxyz').length,
    );
  });

  it('mascara completamente segredos curtos', () => {
    expect(maskSecret('12345678')).toBe('••••••••••');
  });

  it('retorna string vazia para valores ausentes', () => {
    expect(maskSecret(undefined)).toBe('');
    expect(maskSecret(null)).toBe('');
    expect(maskSecret('   ')).toBe('');
  });

  it('ignora espaços nas extremidades', () => {
    expect(maskSecret('  sk-proj-1234567890abcd  ')).toBe('••••••••••abcd');
  });

  it('respeita opções customizadas', () => {
    expect(maskSecret('sk-proj-1234567890abcd', { visibleChars: 2, maskLength: 3 })).toBe('•••cd');
    expect(maskSecret('sk-proj-1234567890abcd', { visibleChars: 0 })).toBe('••••••••••');
  });
});
