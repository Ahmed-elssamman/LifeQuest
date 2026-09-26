import { Prisma } from '@prisma/client';

/** Count consecutive scheduled completions in SQL; history never needs to reach the browser. */
export async function habitStreaks(tx: Prisma.TransactionClient, habitIds: string[], today: Date) {
  if (!habitIds.length) return new Map<string, number>();
  const rows = await tx.$queryRaw<{ id: string; streak: number }[]>`
    WITH evidence AS (
      SELECT h.id,h.frequency,h."weeklyTarget",h."scheduleDays",l.date
      FROM "Habit" h JOIN "HabitLog" l ON l."habitId"=h.id
      WHERE h.id IN (${Prisma.join(habitIds)}) AND l.date>=h."startDate" AND l.date<=${today}::date
        AND (h.frequency<>'CUSTOM' OR EXTRACT(DOW FROM l.date)::int=ANY(h."scheduleDays"))
    ), daily AS (
      SELECT id,date,frequency,"scheduleDays",
        CASE WHEN frequency='CUSTOM' THEN
          FLOOR((date-DATE '1970-01-04')/7.0)*cardinality("scheduleDays") +
          (SELECT COUNT(DISTINCT d) FROM unnest("scheduleDays") d WHERE d<=EXTRACT(DOW FROM date))
        ELSE date-DATE '1970-01-04' END AS ordinal
      FROM evidence WHERE frequency<>'WEEKLY'
    ), runs AS (
      SELECT *,ordinal-ROW_NUMBER() OVER(PARTITION BY id ORDER BY date) AS run FROM daily
    ), daily_results AS (
      SELECT id,MAX(date) AS last,COUNT(*)::int AS streak,frequency,"scheduleDays"
      FROM runs GROUP BY id,run,frequency,"scheduleDays"
    ), weeks AS (
      SELECT id,DATE_TRUNC('week',date)::date AS monday
      FROM evidence WHERE frequency='WEEKLY'
      GROUP BY id,DATE_TRUNC('week',date),"weeklyTarget" HAVING COUNT(*)>="weeklyTarget"
    ), week_runs AS (
      SELECT *,((monday-DATE '1970-01-05')/7)-ROW_NUMBER() OVER(PARTITION BY id ORDER BY monday) AS run FROM weeks
    ), weekly_results AS (
      SELECT id,MAX(monday) AS last,COUNT(*)::int AS streak FROM week_runs GROUP BY id,run
    )
    SELECT id,streak FROM daily_results r WHERE last >= COALESCE((
      SELECT MAX(previous.day)::date FROM generate_series(${today}::date-7,${today}::date-1,interval '1 day') previous(day)
      WHERE r.frequency='DAILY' OR EXTRACT(DOW FROM previous.day)::int=ANY(r."scheduleDays")
    ),${today}::date-1)
    UNION ALL
    SELECT id,streak FROM weekly_results WHERE last>=DATE_TRUNC('week',${today}::date)::date-7`;
  return new Map(rows.map((row) => [row.id, row.streak]));
}
