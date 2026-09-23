import type { ApiValidationIssue } from '@aom/types';
import {
  BadRequestException,
  StandardSchemaValidationPipe,
  type StandardSchemaValidationPipeOptions,
} from '@nestjs/common';

/** Issue do Standard Schema, derivado do próprio pipe do Nest (sem depender da spec diretamente). */
type SchemaIssue = Parameters<
  NonNullable<StandardSchemaValidationPipeOptions['exceptionFactory']>
>[0][number];

function issuePath(issue: SchemaIssue): string {
  return (issue.path ?? [])
    .map((segment) => (typeof segment === 'object' ? String(segment.key) : String(segment)))
    .join('.');
}

export function toValidationIssues(issues: readonly SchemaIssue[]): ApiValidationIssue[] {
  return issues.map((issue) => ({ path: issuePath(issue), message: issue.message }));
}

/**
 * Pipe global de validação: valida `@Body/@Query/@Param({ schema })` com qualquer schema
 * Standard Schema (Zod 4) e devolve o valor transformado (coerções e defaults aplicados).
 * Erros viram `400 VALIDATION_ERROR` com a lista de campos em `details`.
 */
export function createValidationPipe(): StandardSchemaValidationPipe {
  return new StandardSchemaValidationPipe({
    transform: true,
    exceptionFactory: (issues) =>
      new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: toValidationIssues(issues),
      }),
  });
}
