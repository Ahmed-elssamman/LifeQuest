import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Request, Response, Express } from 'express';
import { AppModule } from './app.module';
import { configureApp } from './bootstrap';

let application: Promise<Express> | undefined;
async function initialize() {
  const app = configureApp(
    await NestFactory.create(AppModule, { logger: false, bodyParser: false, abortOnError: false }),
  );
  await app.init();
  return app.getHttpAdapter().getInstance() as Express;
}

export default async function handler(request: Request, response: Response) {
  try {
    application ??= initialize().catch((error: unknown) => {
      application = undefined;
      throw error;
    });
    (await application)(request, response);
  } catch {
    console.error(JSON.stringify({ level: 'error', code: 'SERVERLESS_STARTUP_FAILED' }));
    response.status(503).json({
      code: 'SERVICE_UNAVAILABLE',
      message: 'MIRHAL is temporarily unavailable. Please try again shortly.',
      timestamp: new Date().toISOString(),
    });
  }
}
