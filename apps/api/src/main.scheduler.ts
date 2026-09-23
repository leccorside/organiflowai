import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { runProcess } from './bootstrap/run-process.js';
import { loadConfig } from './config/app-config.js';
import { SchedulerModule } from './scheduler.module.js';

await runProcess('scheduler', async () => {
  const app = await NestFactory.createApplicationContext(SchedulerModule.register(loadConfig()), {
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger));
  app.enableShutdownHooks();
  await app.init();
});
