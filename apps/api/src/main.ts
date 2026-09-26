import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './bootstrap';
import { ChallengesService } from './social/challenges.service';
async function main() {
  if (!process.env['DATABASE_URL']) throw new Error('DATABASE_URL is required.');
  const app = configureApp(
    await NestFactory.create(AppModule, { logger: ['warn', 'error'], bodyParser: false }),
  );
  app.enableShutdownHooks();
  await app.listen(Number(process.env['PORT'] ?? 3333), '0.0.0.0');
  const challenges = app.get(ChallengesService);
  let running = false;
  const timer = setInterval(async () => {
    if (running) return;
    running = true;
    try {
      await challenges.tick();
    } catch {
      console.error(JSON.stringify({ level: 'error', code: 'CHALLENGE_TICK_FAILED' }));
    } finally {
      running = false;
    }
  }, 60000);
  timer.unref();
  console.log(
    JSON.stringify({
      level: 'info',
      event: 'application_ready',
      port: Number(process.env['PORT'] ?? 3333),
      version: '0.1.0',
    }),
  );
}
main().catch(() => {
  console.error(
    JSON.stringify({
      level: 'error',
      code: 'STARTUP_FAILED',
      message: 'Check environment configuration and database availability.',
    }),
  );
  process.exitCode = 1;
});
