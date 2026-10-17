import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { mkdir, writeFile } from 'node:fs/promises';
import { DashboardService } from '../dist/api/apps/api/src/core/dashboard.service.js';
import { XpService } from '../dist/api/apps/api/src/gamification/xp.service.js';

config({ quiet: true });
const url = new URL(process.env.TEST_DATABASE_URL ?? '');
if (!['localhost', '127.0.0.1'].includes(url.hostname) || !url.pathname.endsWith('_test'))
  throw new Error('Performance fixtures require an isolated local test database.');
const db = new PrismaClient({
  datasources: { db: { url: url.href } },
  log: [{ emit: 'event', level: 'query' }],
});
const queries = [];
db.$on('query', (event) => queries.push({ durationMs: event.duration }));
const id = randomUUID();
const today = new Date();
today.setUTCHours(0, 0, 0, 0);
const start = new Date(today.getTime() - 89 * 86_400_000);
const service = new DashboardService(db, new XpService(db));
const results = [];
try {
  const area = await db.lifeArea.findFirstOrThrow({ where: { active: true } });
  await db.user.create({
    data: {
      id,
      email: `${id}@performance.test`,
      passwordHash: 'unusable-fixture-hash',
      status: 'SUSPENDED',
      profile: { create: { displayName: 'Performance fixture', timezone: 'UTC' } },
    },
  });
  for (const [from, count] of [
    [0, 1],
    [1, 99],
  ]) {
    const habits = Array.from({ length: count }, (_, index) => ({
      id: `${id}-${from + index}`,
      userId: id,
      areaId: area.id,
      name: `Performance habit ${from + index}`,
      startDate: start,
      scheduleDays: [],
    }));
    await db.habit.createMany({ data: habits });
    await db.habitLog.createMany({
      data: habits.flatMap((habit) =>
        Array.from({ length: 90 }, (_, day) => ({
          habitId: habit.id,
          userId: id,
          date: new Date(start.getTime() + day * 86_400_000),
          createdAt: new Date(start.getTime() + day * 86_400_000),
          value: 1,
          targetSnapshot: 1,
          note: 'Private fixture reflection. '.repeat(8),
        })),
      ),
    });
    const samples = [];
    for (let sample = 0; sample < 3; sample++) {
      queries.length = 0;
      const begin = performance.now();
      const response = await service.summary({ id, role: 'USER', timezone: 'UTC', sessionId: '' });
      samples.push({
        durationMs: Math.round(performance.now() - begin),
        queries: queries.length,
        databaseMs: queries.reduce((sum, query) => sum + query.durationMs, 0),
        responseBytes: Buffer.byteLength(JSON.stringify(response)),
        returnedLogEntries: response.habits.reduce(
          (sum, habit) => sum + (habit.logs?.length ?? 0),
          0,
        ),
      });
    }
    results.push({ habits: from + count, logRows: (from + count) * 90, samples });
  }
  await db.$executeRawUnsafe('ANALYZE "HabitLog"');
  const plan = await db.$queryRaw`EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
    SELECT id FROM "HabitLog" WHERE "userId"=${id} AND "createdAt">=${today.toISOString()}::timestamp`;
  if (plan[0]?.['QUERY PLAN']?.[0]?.Plan?.['Actual Rows'] !== 100)
    throw new Error("The evidence query must include today's 100 fixture logs.");
  await mkdir('.local/audit', { recursive: true });
  await writeFile('.local/audit/api-performance.json', JSON.stringify({ results, plan }, null, 2));
  console.log(JSON.stringify(results));
} finally {
  await db.habitLog.deleteMany({ where: { userId: id } });
  await db.habit.deleteMany({ where: { userId: id } });
  await db.user.deleteMany({ where: { id } });
  await db.$disconnect();
}
