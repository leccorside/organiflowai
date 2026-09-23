/**
 * Caminhos removidos dos logs (substituídos por "[REDACTED]").
 * O pino suporta curinga de um nível (`*.campo`); cobre o campo na raiz,
 * dentro de qualquer objeto de primeiro nível e nos headers sensíveis.
 */
const SENSITIVE_FIELDS = [
  'password',
  'passwordHash',
  'currentPassword',
  'newPassword',
  'token',
  'accessToken',
  'refreshToken',
  'apiKey',
  'secret',
  'clientSecret',
  'authorization',
  'cookie',
] as const;

export const REDACT_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["x-api-key"]',
  'res.headers["set-cookie"]',
  ...SENSITIVE_FIELDS,
  ...SENSITIVE_FIELDS.map((field) => `*.${field}`),
];

export const REDACT_CENSOR = '[REDACTED]';
