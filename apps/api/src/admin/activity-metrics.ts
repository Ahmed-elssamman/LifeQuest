import { Database } from '../common/database';

/** Aggregate current active schedules only; no journal or exact behavioral values leave the API. */
export async function activityMetrics(db: Database) {
  const rows = await db.$queryRaw<{ expected: number; completed: number }[]>`
    WITH scheduled AS (
      SELECT h.id, h.frequency, h."weeklyTarget", d.day::date AS day
      FROM "Habit" h JOIN "Profile" p ON p."userId"=h."userId" JOIN "User" u ON u.id=h."userId" AND u.status='ACTIVE'
      CROSS JOIN LATERAL generate_series(
        GREATEST(h."startDate", (CURRENT_TIMESTAMP AT TIME ZONE p.timezone)::date - 29),
        (CURRENT_TIMESTAMP AT TIME ZONE p.timezone)::date, interval '1 day'
      ) d(day)
      WHERE h.status='ACTIVE' AND (h.frequency<>'CUSTOM' OR EXTRACT(DOW FROM d.day)::int=ANY(h."scheduleDays"))
    ), per_habit AS (
      SELECT s.id,
        CASE WHEN s.frequency='WEEKLY' THEN CEIL(COUNT(*) * s."weeklyTarget" / 7.0) ELSE COUNT(*) END AS expected,
        COUNT(l.id) AS completed
      FROM scheduled s LEFT JOIN "HabitLog" l ON l."habitId"=s.id AND l.date=s.day
      GROUP BY s.id,s.frequency,s."weeklyTarget"
    )
    SELECT COALESCE(SUM(expected),0)::float AS expected,
      COALESCE(SUM(LEAST(completed,expected)),0)::float AS completed FROM per_habit`;
  const { expected, completed } = rows[0] ?? { expected: 0, completed: 0 };
  return {
    habitCompletionRate: expected ? Math.round((completed / expected) * 100) : 0,
    scheduledActions: expected,
    completedScheduledActions: completed,
  };
}
