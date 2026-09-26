# Testing

Use Vitest throughout. Domain tests cover progress strategies, level/balance separation, habit schedules, streaks, timezone boundaries, minimum actions, deterministic challenge modes, daily caps, percentage improvement and incomplete observations. Contract tests protect validation, mass assignment and PATCH semantics.

Angular's unit-test builder compiles templates and runs Vitest in jsdom. Tests exercise HTTP credentials/loading/errors/retries, stale-response rejection, accessible field IDs, progress bounds, retry actions and bilingual/theme/motion preferences. Browser tests are responsible for real layout and overlay behavior.

Integration suites boot the actual NestJS app and use Supertest against migrated local PostgreSQL. They verify auth/recovery, origin protection, ownership, transaction races, duplicate XP, reward overdraft/refund, immutable challenge snapshots/results, private friend/challenge serialization, admin roles/content, notification preferences, erasure and audit history. Fixtures are isolated and do not rely on production data.

Coverage scopes are explicit: domain/contracts and backend source, with 80% statements/functions/lines and 70% branches. Backend startup is exercised by E2E and excluded from integration instrumentation. Explicit DI avoids generated reflection branches; production and tests use the same setting. Never add coverage-ignore directives or reduce thresholds merely to get green checks.

Playwright starts production customer/admin builds and a dedicated API against `lifequest_e2e_test`. It covers registration/onboarding, linked work, habits/check-in/quests, XP/rewards, feedback/admin, social challenges, mobile widths, RTL/themes/reduced-motion and axe checks. Failures retain ignored traces/screenshots for diagnosis. These artifacts can contain test account or personal fixture data and are not source assets.

Run the commands in the README in order after changes. A build is necessary before E2E. Avoid simultaneous integration runs against the same database. CI runs all validation stages and uploads only failure artifacts with short retention; it does not deploy.

Critical interaction tests block previously installed service workers so Playwright's explicit API fixtures can reach the server. A short valid challenge deadline allows the actual activation, scoring and completion transactions to run during E2E without a production time-travel endpoint. PWA policy is independently inspectable in the generated `ngsw.json` and source configuration; API responses are excluded.

Planning/recovery regressions cover merged date validation and database constraints, project/goal consistency, custom rest days, completed weekly commitments, atomic Habit Lab adjustments, KEEP semantics and accessible schedule inputs. Browser suites additionally save/reload advanced planning fields, project milestones, subtasks, unsaved experiments and a temporary API failure followed by retry. `node tools/browser-smoke.mjs` checks running development applications and their configured database using environment-provided demo credentials; it signs in and reads both applications without editing personal work.
