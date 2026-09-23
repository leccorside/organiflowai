export const SECRET_MASK_CHAR = '•';

export interface MaskSecretOptions {
  /** Quantidade de caracteres finais exibidos. Padrão: 4. */
  visibleChars?: number;
  /** Tamanho fixo da máscara, para não revelar o comprimento real do segredo. Padrão: 10. */
  maskLength?: number;
}

/**
 * Mascara um segredo (ex.: API Key) para exibição: `••••••••••abcd`.
 *
 * Segredos curtos demais (até o dobro de `visibleChars`) são mascarados por completo,
 * pois exibir o final revelaria parte significativa do valor.
 */
export function maskSecret(
  secret: string | null | undefined,
  { visibleChars = 4, maskLength = 10 }: MaskSecretOptions = {},
): string {
  const value = secret?.trim() ?? '';
  if (value === '') {
    return '';
  }

  const mask = SECRET_MASK_CHAR.repeat(maskLength);
  if (visibleChars <= 0 || value.length <= visibleChars * 2) {
    return mask;
  }

  return mask + value.slice(-visibleChars);
}
