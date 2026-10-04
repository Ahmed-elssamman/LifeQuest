# Deployment baseline — 2026-10-04

See [the audit baseline](../audit/baseline.md) for the earlier project review. This snapshot records the state immediately before the Render/Neon/email work.

## Existing architecture

- Nx 22 workspace: Angular 21 customer `web` (SSR with two prerendered routes), Angular 21 `admin` SPA, NestJS 11 `api`, shared libraries. Browser API calls are relative `/api/*` and use HttpOnly session cookies.
- The API currently runs at port 3333 and prefixes routes with `/api`; `/api/health` queries PostgreSQL. CORS accepts `WEB_ORIGIN` and `ADMIN_ORIGIN`, with credentials. Writes also require an allowed Origin header. Nest enables shutdown hooks.
- Prisma 6 uses PostgreSQL `DATABASE_URL` for runtime and `DIRECT_URL` for migrations. Migrations are committed; `db:deploy` uses `prisma migrate deploy`. Local test databases are created by `npm run db:local`.
- `MailAdapter` serves auth verification and password reset only. It saves development messages to `.local/mail`, uses Nodemailer SMTP when configured, and uses an in-memory outbox in tests. It lacks a production API provider, HTML templates, language selection, and differentiated delivery errors. No welcome, challenge, or reward email flow exists.
- Preferences use bilingual inline strings and set document `lang`/`dir` dynamically. Authenticated language is persisted in `Profile.language`, but the default is English in both Prisma and the browser. Registration does not send a language. Static HTML starts with `lang="en"`.
- Existing deployment is two Vercel projects. The customer deployment bundles the API as a Vercel function; the admin deployment proxies `/api` to it. The existing production documentation says email is disabled. No Render deployment configuration exists.

## Baseline checks

| Check                               | Result before changes                                                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `npm ci --ignore-scripts`           | PASS; npm reported 20 dependency advisories (2 moderate, 18 high).                                                        |
| `npm run db:generate`               | PASS; Prisma warned that `package.json#prisma` is deprecated.                                                             |
| `npm run typecheck`, `npm run lint` | PASS.                                                                                                                     |
| `npm run test`                      | PASS; 42 tests. Vitest emitted a future native config loader warning.                                                     |
| `npm run test:frontend`             | PASS; 31 tests.                                                                                                           |
| `npm run db:validate`               | PASS.                                                                                                                     |
| `npm run db:check-migrations`       | Initially failed because local PostgreSQL was stopped; PASS after `npm run db:local`.                                     |
| `npm run security:check`            | PASS.                                                                                                                     |
| `npm run build`                     | PASS from Nx cache. Nx daemon failed to compute a graph and disabled itself; a fresh build is still required after edits. |
| Integration                         | PASS; 67 tests after starting the local test database.                                                                    |
| E2E                                 | PASS; 15 browser tests (3.2 minutes) against the pre-change build.                                                        |

## Pre-existing risks and blockers

- Existing Vercel deployment scripts and smoke tests assume the API and web app share an origin. They cannot verify a Render API without adaptation.
- Session cookies use `SameSite=Lax`; a separate Vercel and Render origin may require a same-origin proxy or a deliberate cross-site cookie policy. A proxy is preferable for the existing auth contract.
- Non-Vercel persistent feedback upload storage needs configuration. Render's ephemeral filesystem is unsuitable for persistent screenshots.
- `MAIL_MODE=development` silently writes mail to disk. That must never be a production delivery mode.
- A Render Free web service can sleep when idle, causing cold starts. It cannot promise continuous availability.
- Dependency advisories and Nx daemon warning predate this work. No real Gmail, transactional provider, Neon, Render, or Vercel account configuration was supplied for end-to-end production verification.

## New problems introduced by changes

None at this baseline snapshot. Record later regressions in the final audit.
