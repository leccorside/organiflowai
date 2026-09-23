export const SEED_MIN_PASSWORD_LENGTH = 12;

// Trechos do valor de exemplo do .env.example (ex.: "change-me-123456" também é recusado).
const PLACEHOLDER_PATTERN = /change-?me/i;

export interface SeedConfig {
  superAdmin: {
    email: string;
    name: string;
    password: string;
  };
}

/**
 * Lê e valida a configuração do seed a partir do ambiente.
 * Credenciais só vêm de variáveis de ambiente; valores de exemplo são recusados.
 */
export function readSeedConfig(env: Record<string, string | undefined>): SeedConfig {
  const email = env.SEED_SUPER_ADMIN_EMAIL?.trim().toLowerCase() ?? '';
  const password = env.SEED_SUPER_ADMIN_PASSWORD ?? '';
  const name = env.SEED_SUPER_ADMIN_NAME?.trim() || 'Super Admin';

  const errors: string[] = [];
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('SEED_SUPER_ADMIN_EMAIL ausente ou inválido');
  }
  if (password.length < SEED_MIN_PASSWORD_LENGTH) {
    errors.push(
      `SEED_SUPER_ADMIN_PASSWORD deve ter ao menos ${SEED_MIN_PASSWORD_LENGTH} caracteres`,
    );
  } else if (PLACEHOLDER_PATTERN.test(password)) {
    errors.push('SEED_SUPER_ADMIN_PASSWORD não pode ser um valor de exemplo');
  }
  if (errors.length > 0) {
    throw new Error(`Configuração de seed inválida: ${errors.join('; ')}`);
  }

  return { superAdmin: { email, name, password } };
}
