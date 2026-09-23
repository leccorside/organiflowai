import type { ProcessRole } from '../logging/logging.module.js';

/**
 * Executa o bootstrap de um processo. Falhas antes de o logger do Nest existir
 * (ex.: configuração inválida) são escritas em JSON no stderr e encerram com código 1.
 */
export async function runProcess(role: ProcessRole, bootstrap: () => Promise<void>): Promise<void> {
  try {
    await bootstrap();
  } catch (error) {
    process.stderr.write(
      `${JSON.stringify({
        level: 'fatal',
        service: role,
        time: new Date().toISOString(),
        message: 'Falha na inicialização do processo',
        error: error instanceof Error ? error.message : String(error),
      })}\n`,
    );
    process.exit(1);
  }
}
