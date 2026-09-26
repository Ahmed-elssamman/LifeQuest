# Database

`prisma/schema.prisma` defines the normalized relational model. Migration SQL adds checks and immutability triggers not expressible in Prisma. Apply migrations with `db:deploy`; develop new migrations with `db:migrate`. Never reset shared Neon or manually edit deployed schemas. Runtime uses the pooled `DATABASE_URL`; CLI migrations use `DIRECT_URL`.

The initial migration creates all domain relations. The integrity migration enforces positive amounts, bounded progress/mood/energy, ordered challenge dates, no self-friendship and one milestone parent. It makes XP/audit append-only and freezes challenge rules/baselines/results. The snapshot migration backfills eligible habits/timezones and freezes eligibility, scoring configuration and metrics. Existing final seeded results are preserved; a backfill cannot reconstruct unrecorded historical habit edits.

Important uniqueness rules include one habit log per habit/calendar day, one check-in per user/day, one participant per challenge/user, one final score per participant/challenge, one friendship per sorted pair, one achievement unlock per user/achievement, and globally unique XP/redemption idempotency keys.

Indexes follow list patterns: user/status, habit/date, due dates, project/goal foreign keys, challenge state/timing, notification read state, feedback status/category and audit timestamps. Avoid adding indexes without an actual query pattern. JSON is reserved for flexible analytic/audit/XP metadata.

Account deletion erases personal free text, reflections, experiments, feedback attachments/replies, analytics and social connections, invalidates identity and sessions, and anonymizes retained domain records. Minimal pseudonymous append-only XP, audit and challenge evidence remains for integrity. A production retention/purge policy must be chosen explicitly for the deployment jurisdiction.

Local integration tests deploy migrations into a `_test` database. E2E uses a separate test database. `db:check-migrations` replays SQL into an isolated local shadow database and compares it with the Prisma schema.

Migration four adds `QuestTemplate` and ordered `QuestTemplateItem` records for optional staff-published missions. Users copy templates into their own independent quests; editing a template never rewrites existing user work. Avatar presets and private screenshot metadata use the original profile/feedback models.

`core/habit-streaks.ts` calculates complete daily/custom/weekly runs with indexed log evidence and SQL window functions. Client list payloads keep only recent logs; a long streak is not limited by the display window.

Migration five enforces ordered start/end dates for goals, projects and tasks. The API validates merged PATCH values before writing; equal dates and optional open-ended plans remain valid. Project moves cannot silently leave tasks explicitly linked to a different goal.
