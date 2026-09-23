import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { runProcess } from './bootstrap/run-process.js';
import { loadConfig } from './config/app-config.js';
import { WorkerModule } from './worker.module.js';

await runProcess('worker', async () => {
  const app = await NestFactory.createApplicationContext(WorkerModule.register(loadConfig()), {
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger));
  app.enableShutdownHooks();
  await app.init();
});
