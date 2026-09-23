// O runtime ESM do Jest recusa `require()` de um módulo ESM que ainda está sendo carregado
// ("require(esm) in a cycle"). Bibliotecas CJS do ecossistema Nest (nestjs-pino, throttler)
// fazem require('@nestjs/common'), que é ESM no Nest 12. Pré-carregar os módulos do Nest
// garante que já estejam avaliados quando essas bibliotecas os requisitarem.
await import('reflect-metadata');
await import('@nestjs/common');
await import('@nestjs/core');
