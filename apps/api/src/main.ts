import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
import { configureHttpApp } from './bootstrap/configure-http-app.js';
import { runProcess } from './bootstrap/run-process.js';
import { loadConfig } from './config/app-config.js';

await runProcess('api', async () => {
  const config = loadConfig();
  const app = await NestFactory.create<NestExpressApplication>(AppModule.register(config), {
    bufferLogs: true,
    bodyParser: false,
  });
  configureHttpApp(app, config);
  await app.listen(config.http.port, '0.0.0.0');
});
