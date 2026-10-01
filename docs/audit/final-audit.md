# LifeQuest production readiness audit

Date: 28 September 2026. Scope: current workspace source, clean dependency installation, local production artifacts, isolated PostgreSQL, and read-only Neon connectivity/schema checks. This supersedes the [26 September verification record](../architecture/verification.md) for current source.

## 1. Executive summary

The audit found and fixed dependency incompatibility, authentication races, friend-block ownership bypass, inaccurate moderation responses/audits, challenge scoring dependence on live XP, timezone-sensitive raw SQL, unnecessarily large dashboard payloads, misleading registration failure after temporary mail outages, and test coverage interference. Existing architecture and the Tailwind/PrimeNG design were preserved.

The final source passes production builds for web/admin/API, migration replay/schema comparison, lint/type checks, 32 domain/contract tests, 31 Angular tests, and 66 PostgreSQL/HTTP integration tests with coverage. Twelve Chromium browser suites exercise the built applications; final browser measurements are recorded below. No known dependency vulnerabilities were reported by npm audit.

**Release status: locally verified candidate; not a claim of complete deployed production readiness.** The changed source and two additive migrations have not been released. Real email delivery and private Blob round trips remain unverified because their credentials are absent. Restore/failover, sustained production load and manual assistive-technology certification remain outside the observed evidence. See section 14 for severity and next action for every remaining limitation.

## 2. Architecture audit

Inspected all three apps, eight shared libraries, project manifests, package/lockfile, Nx/TypeScript configuration, routes, Prisma schema/migrations/seeds, environment examples, scripts, CI and documentation. Angular configuration lives in Nx `project.json` files; there is no requirement for a separate `angular.json`. Vercel Build Output API packaging is the established deployment architecture; no Docker application deployment or replacement framework was introduced. CI's PostgreSQL service uses a container.

- Web and admin have separate Angular entry points, route trees, builds and deployment artifacts. The API is NestJS/Express with Prisma access to PostgreSQL/Neon.
- Shared libraries cover domain calculations, Zod contracts, auth, data access/models, forms, UI, preferences and app providers. Eleven Nx projects were observed, with no app-to-app dependencies.
- A static scan of 122 production TypeScript files found no unresolved local imports or static import cycles. Production compilation additionally checks template/import correctness. This is not a proof about every possible runtime dependency.
- The largest production TS file is the shared response-model catalog at 332 lines; the largest template is the challenge screen at 349 lines. No indiscriminate component rewrite was warranted. Challenge moderation orchestration was moved from the controller to its service. Some bounded read queries and small account/content workflows still reside in controllers (section 14).
- Unused Angular animations/Nest testing dependencies and unused theme presets were removed. The public entry no longer includes admin datatable tokens.

Compatibility is now supported: Angular 21.2.24, CDK 21.2.14, PrimeNG 21.1.10 and PrimeUIX themes 2.0.3. PrimeNG 19 declares Angular 19 peers; its old Angular peer overrides were removed. TypeScript 5.9 satisfies Angular compiler-cli's >=5.9 <6.1 range. Nx remains 22.7.12, Prisma/client 6.19.3, Tailwind 4.3.3, Vitest 4.1.11 and Playwright 1.63.0 in the observed lockfile. Local verification used Node 24.21.0 and npm 11.19; CI targets supported Node 22. See [ADR 001](../decisions/001-stack-compatibility.md).

## 3. Frontend audit

Both applications use lazy standalone routes, OnPush components, signals/computed state, typed forms and shared data-access/error handling. Private route guards are navigation controls; the API enforces actual permissions. HTTP credentials, loading/error/retry behavior and stale-response rejection have unit coverage.

Fixed session state so a late `/auth/me` response cannot restore an invalidated session. Failed logout now preserves the visible session and shows an actionable retry message in both shells. Preference media-query listeners are removed on destruction. Registration remains authenticated when sending verification temporarily fails and shows a persistent, bilingual instruction to resend from Settings.

The dashboard uses a narrow `HabitSummary` response without raw habit logs/private notes. Full habit records remain available only through the appropriate owned endpoints. Analytics/chart code remains in lazy routes; overlays and level celebrations remain deferred. No heavy visualization library was added. PWA rules exclude private API responses and mutation replay.

## 4. Backend audit

Inspected auth, planning, habits, reflections, quests, XP, rewards, achievements, account/export/erasure, friends, challenges, feedback/attachments, notifications, content, admin insights, maintenance, database access, guards, validation and error handling.

- External request bodies and collection query parameters use strict Zod contracts; unknown privileged fields are rejected. Collection reads are paginated or deliberately bounded summaries/reference selections. The page number now has an explicit upper bound.
- Malformed and oversized JSON return structured 400/413 errors, request IDs and `no-store`, without leaking the body or stack. Request metadata/origin checks precede body parsing.
- Password verification is followed by a locked recheck before session issuance. Suspension/deletion/password reset races cannot mint a session from a stale user snapshot. Expired sessions cannot be refreshed after an earlier guard check. Erased hashes return ordinary authentication failure.
- Moderation locks/rechecks actor and challenge, returns 404 for missing and 400 for already-ended challenges, and creates an audit entry only for a real cancellation.
- Account deletion rechecks active status/password under lock, cancels unfinished shared challenges, revokes credentials and performs content erasure transactionally. This prevents lifecycle completion from recreating erased account analytics/XP. Attachment removal is scheduled durably before metadata disappears, attempted immediately, and retried by authenticated maintenance or the standalone worker after failure. A regression simulates storage failure and worker restart, then verifies successful removal.
- Health executes a real database query. Swagger documents validated input in nonproduction environments. Logging records request metadata without request bodies, cookies or query-string tokens.

Controllers for the main planning/gamification/social flows delegate to services. No blanket claim is made that every controller contains only transport code.

## 5. Database audit

Prisma validation and generation passed. All eight migrations replay against an isolated shadow database and match the Prisma schema. Existing uniqueness/check/immutability rules cover habit/day logs, user/day check-ins, friendship pairs, participants, final scores, achievement unlocks, XP/redemption idempotency, ordered dates, positive/bounded values and append-only XP/audit evidence.

The new additive migration `20260928180000_audit_query_indexes` adds nine indexes: milestone goal/project parents, task goal/parent links, feedback replies by conversation/time, feedback attachments by conversation, habit evidence by user/time, and session/token expiry. Existing migration files were preserved. The evidence query uses the new `HabitLog_userId_createdAt_idx`; section 7 records the measured plan.

Both configured Neon runtime and direct connections succeeded in read-only checks. Six finished, non-rolled-back migrations were observed. Read-only schema comparison found only the expected nine query indexes and the new attachment-deletion outbox/index. External certificate-verified TLS 1.3 was confirmed on both endpoints. Neon's TLS termination means backend `pg_stat_ssl` is not a reliable description of client-to-edge transport. No connection strings or secrets are included here. The eighth migration (`20260928190000_attachment_cleanup`) adds a durable queue of opaque storage keys; account erasure schedules cleanup in the same transaction that removes attachment metadata.

The seed was executed by the isolated browser harness and integration fixtures. Reference data and environment-supplied account credentials were verified locally; production accounts were not reseeded. No Neon reset, migration deployment or production-data mutation was performed.

Raw SQL now passes literal calendar dates and explicitly cast UTC timestamp text. Tests using `Pacific/Honolulu` and `Africa/Cairo` verify 60-second rate-limit expiry, complete daily streaks, and monthly XP including both month boundaries. This fixes implicit PostgreSQL timezone conversions discovered during query measurement.

## 6. Security audit

Server controls include Argon2id hashing, random hashed opaque session/recovery tokens, HttpOnly cookies, production Secure cookies, SameSite=Lax, explicit origins for writes, credentialed allowlisted CORS, Helmet, input size limits, rate limiting, and server RBAC. Authentication uses opaque sessions; a JWT secret is neither needed nor invented. `.env.example` documents production cookie/environment requirements, separate local test URLs, optional seed credentials, SMTP, Blob and cron configuration.

Tests exercise IDOR/linked-object ownership, mass assignment, stale staff roles, suspension, recovery token replay/session revocation, unauthorized admin endpoints, shared atomic rate limits, reward overdrafts/replays, duplicate completions, immutable ledger/results and privacy serialization. A blocked participant can no longer take ownership of the existing block and remove it.

Private challenge output excludes others' baselines, precise observations, habit descriptions, journals and mood. Score/progress/streak fields obey backend sharing flags and blocked connections. Version 2 scoring uses frozen habit points independent of wallet or XP transactions; existing version 1 agreements retain their historical rules. Unique ledgers and transactional awarding prevent repeated XP/reward/achievement grants.

Configured-secret scanning passes for source/docs/tests/tools and the local deployment artifacts. The final artifact scan inspected 1,568 text files without matching configured secret values. This is a focused configured-secret check, not a universal credential detector. Git ignores environment files, local mail, credentials, test artifacts and deployment state. Dependency audit reports zero known vulnerabilities across production/development dependencies; this is not proof of absence of vulnerabilities.

## 7. Performance audit

Production initial bundle sizes:

| Application | Raw initial JS/CSS | Estimated transfer | Budget               |
| ----------- | -----------------: | -----------------: | -------------------- |
| Web         |          546.95 kB |          141.88 kB | Below 550 kB warning |
| Admin       |          526.73 kB |          134.31 kB | Below 550 kB warning |

The backend's traced Vercel function is 23.9 MiB uncompressed, with 1,486 traced files including Linux Prisma/Argon2 bindings. Web/admin output remains separate. No analytics chart/admin feature is imported into the public entry.

A repeatable local dashboard benchmark uses one and one hundred habits, ninety days each, and three samples per fixture size. It creates/cleans only its disposable local test account. Before minimization, the 100-habit response was 119,011 bytes with 224 unnecessary returned log records; afterward it is 6,491 bytes with zero logs, a **94.5% reduction**. The one-habit response fell from 18,177 to 4,112 bytes. Query count stays at 17 for both fixture sizes, with no per-habit query growth in this measured flow. Internal log reads select dates only.

Final latency and browser measurements are recorded in section 16. Samples are diagnostics from a shared local machine, not field percentiles or a controlled production load experiment. The prior 100-habit samples were 281–291 ms; different machine load prevents attributing all timing differences to the code change. Payload reduction is the directly comparable result.

Pagination/bounded summary reads, local assets, lazy analytics and private-response cache policy were reviewed. SSR verification checks prerendered public headings, HTML/service-worker revalidation and immutable hashed-bundle caching. Long-lived personal exports and full-history aggregates have not been capacity-tested for exceptionally large accounts (section 14).

## 8. UX audit

Reviewed rendered desktop/mobile captures of the customer and admin route matrices, including English/light and Arabic/dark. Shared spacing, typography, cards, forms, dialogs, empty states and navigation remain consistent with the established Tailwind/PrimeNG design. Mobile admin tables use named horizontal scroll regions rather than overflowing the page.

The help page now connects Goal → Project → Task → Habit → Daily check-in → Quest → XP → Level → Achievement → Reward → Challenge → Monthly review, with Habit Lab as an additional recovery step. All twelve stages have interactive buttons and bilingual explanations. Levels and achievements now have distinct explanations; beginner mode offers four starting points and resets invalid selections. Keyboard tests visit every stage, check RTL and mode switching, and validate reduced motion.

Registration email failures and logout failures now give clear next actions. Core browser flows verify completion/reward feedback, saved reflections, private attachments, admin replies, unsaved changes, and successful retry after an API failure. No new visual asset generator or replacement design system was needed.

## 9. Accessibility audit

The route suites check eight CSS widths: 320, 360, 390, 412, 768, 1024, 1280 and 1440. Seventeen customer routes and thirteen admin routes are checked at each width in English/light and Arabic/dark. Dashboard/Today have additional coverage. Axe uses WCAG 2 A/AA, 2.1 AA and 2.2 AA tags on desktop/light and mobile/dark route states.

An observed help-card contrast failure was fixed by keeping text visible during animation, animating only the icon, and increasing the text's opacity. Shared form labels/errors, named table scroll regions, focusable dialogs, visible focus, mobile navigation and reduced motion are exercised by rendered tests. The help test preserves keyboard focus when selecting a stage and checks that no animation remains running under reduced motion.

These checks and visual review found no remaining failure in the tested states. They do not certify all possible data/overlay states, real touch devices or manual screen-reader behavior.

## 10. Testing audit

| Layer                   | Final passing tests | What it establishes                                                           |
| ----------------------- | ------------------: | ----------------------------------------------------------------------------- |
| Vitest domain/contracts |                  32 | Progress, schedules/streaks, levels, challenge modes, validation              |
| Angular/Vitest/jsdom    |                  31 | Shared state, auth races, API/errors/retry, forms, preferences, UI primitives |
| NestJS/Prisma/Supertest |                  66 | Real PostgreSQL transactions, HTTP/permissions/privacy and regression rules   |
| Playwright/Chromium     |                  12 | Built web/admin/API flows, layouts, axe, keyboard/help and runtime behavior   |

| Instrumented scope | Statements | Branches | Functions |  Lines |
| ------------------ | ---------: | -------: | --------: | -----: |
| Domain/contracts   |     98.91% |     100% |    97.87% | 98.68% |
| API                |     90.09% |   75.15% |     95.4% | 91.66% |

Thresholds remain 80% statements/functions/lines and 70% branches. Frontend checks do not establish whole-frontend percentage coverage. Startup/real browser behavior is covered separately.

API/HTTP coverage includes registration/login/logout/recovery, protected routes/RBAC, linked planning, habit duplicates, daily check-in, quest completion, XP/levels/achievements, reward overdraft/refund/idempotency, friend/challenge privacy and lifecycle, admin users/catalogs/feedback/audits, bug/suggestion/complaint workflows and internal-note exclusion. Recovery uses a test outbox; no real email was sent.

Several regressions were first reproduced as failing tests: JSON error statuses, login/refresh races, block takeover, temporary registration mail failure and timezone-shifted expiry. A final coverage run exposed overlapping report directories; domain/API now write to sibling directories so cleaning one does not delete the other's temporary files. Both coverage suites subsequently ran successfully together. The attachment cleanup regression also proves that a failed delete remains queued after account erasure and can be retried by a new worker instance. Test bootstrap also strips inherited SMTP/Blob/Vercel/demo credentials and uses private local uploads.

Browser tests start built web on 4300, admin on 4301 and API on 3433, exercise migrated/seeded local PostgreSQL and then stop their servers. Their separate `_e2e_test` database is never Neon. Existing 26 September live smoke evidence is historical and is not presented as validation of these new source changes.

## 11. Admin audit

The separate admin app covers overview, users/details/status/roles, activity/planning analytics, feedback/status/replies/internal notes, challenge moderation, rewards/achievements/help/announcement catalogs, quest templates, audit logs, settings and health.

Backend RBAC/selective serialization protects these endpoints independently of frontend routes. Tests reject ordinary-user access, unauthorized support escalation and stale staff credentials. Catalog changes and valid moderation are audited. Invalid/repeated cancellation no longer reports false success or creates misleading audit history. Thirteen admin routes pass the layout/axe matrix. Admin table theme tokens are loaded only by the admin entry.

## 12. Issues discovered

| ID  | Severity | Finding                                                                      | Outcome                                                             |
| --- | -------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| A01 | High     | Angular 21 paired with unsupported PrimeNG 19 Angular peers                  | Supported PrimeNG 21/PrimeUIX pairing                               |
| A02 | High     | Login could mint a session after password/status changed during verification | Locked recheck and transactional session creation                   |
| A03 | High     | A blocked participant could replace block ownership and remove it            | Server rejects other-party block mutations                          |
| A04 | Medium   | Refresh could extend a session that expired after the guard check            | Expiry/absolute lifetime rechecked under lock                       |
| A05 | Medium   | Malformed/oversized JSON returned 500 and lacked early request metadata      | Safe 400/413 with request ID/no-store                               |
| A06 | High     | New challenge score depended on later live XP settings                       | Version 2 frozen points, historical version 1 preserved             |
| A07 | Medium   | Account erasure left unfinished challenges eligible for later awards/events  | Cancel unfinished challenges before erasure                         |
| A08 | Medium   | Moderation audited nonexistent/already-ended challenges as successful        | Exact HTTP failures, audit only real transition                     |
| A09 | Medium   | Future-start work appeared in dashboard Today                                | Start date included in selection                                    |
| A10 | Medium   | Dashboard sent unnecessary raw habit history/private notes                   | Narrow summary, selected log dates; 94.5% smaller fixture payload   |
| A11 | Medium   | Late auth responses and failed logout caused misleading local session state  | Revision guard and retryable logout feedback                        |
| A12 | Medium   | SMTP failure left an existing account behind a failed-registration screen    | Usable registration plus verification resend notice                 |
| A13 | Medium   | Raw timestamp/date binding depended on database timezone                     | Explicit UTC/calendar casts with two-zone regressions               |
| A14 | Medium   | Coverage cleanup could delete a concurrently running API report              | Separate sibling report directories                                 |
| A15 | Medium   | Missing indexes on evidence/parent/cleanup queries                           | Additive nine-index migration, verified locally                     |
| A16 | Medium   | Help transition caused observed contrast failure; levels/achievements merged | Visible text, adjusted contrast, distinct interactive explanations  |
| A17 | Low      | Invalid optional build peers, unused deps/presets and leaked media listener  | Peer resolution, removal and listener cleanup                       |
| A18 | Medium   | Test bootstrap could inherit deployment storage/mail credentials             | Explicit local test environment isolation                           |
| A19 | Medium   | Erasure could lose attachment cleanup references after a storage failure     | Transactional deletion outbox, delayed retry and restart regression |

Severity reflects impact in the affected conditions, not an assertion of exploitation in production.

## 13. Issues fixed

A01–A19 are fixed in the working tree and covered by the verification above. A15/A19 SQL is locally validated and remains pending deployment, alongside the other source fixes. No peer-dependency bypass, lowered coverage threshold, disabled protection, production reset or unnecessary technology migration was used.

README, compatibility ADR, implementation record, database/frontend/testing guides and challenge semantics were updated. The earlier verification report is clearly marked historical. CI now checks complete dependency resolution and dependency advisories, in addition to its existing build/test/security stages. Exact verification commands follow.

## 14. Remaining limitations

| Severity                     | Area                                | Why it remains                                                                                                                               | Recommended next action                                                                                                                  |
| ---------------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| High release requirement     | Deployed source/database            | This audit prepared and tested a local candidate; the old release and six migrations remain on Neon/Vercel                                   | Release the reviewed changes and two additive migrations, then run deployed critical-flow/health/cache checks                            |
| High if recovery is required | SMTP                                | SMTP host/from/user/password are absent; the existing deployment explicitly disables email                                                   | Configure approved SMTP credentials, enable mail, verify delivery and real recovery links in staging and production                      |
| Medium                       | Private Blob operations             | `BLOB_READ_WRITE_TOKEN` is absent locally; local adapter authorization/signature/size tests do not prove cloud round trips                   | Supply a staging private Blob token and verify upload/read/delete, failed-delete recovery and retention before certifying storage        |
| Medium                       | Backup, retention, restore/failover | Provider backup restore/failover drills and jurisdiction-specific retention decisions were not available in this session                     | Set retention, perform a staging restore drill and record RPO/RTO; exercise eventual cleanup after external storage failures             |
| Medium                       | Sustained scale                     | Measurements use local fixtures; exports/full-history summaries and multi-instance production load are not capacity-certified                | Benchmark large real-shaped accounts in staging, measure query percentiles and memory, then introduce streaming/aggregation if warranted |
| Medium                       | Browser/manual accessibility        | Only Chromium automation and rendered visual/keyboard review were executed                                                                   | Run Firefox/WebKit, real mobile/touch and manual screen-reader/focus/zoom testing before claiming broad WCAG/browser certification       |
| Low                          | Historical monthly interpretation   | Goal/project progress and habit schedules use current configuration; the UI discloses it                                                     | Add historical configuration snapshots only if historical reconstruction becomes a product requirement                                   |
| Low                          | Existing challenge version 1        | Changing already-agreed baselines/scoring would rewrite historical contracts                                                                 | Keep version 1 immutable; all new challenges use independent version 2 points                                                            |
| Low                          | Controller organization             | Some bounded queries and small account/content workflows remain in controllers; a broad rewrite was not necessary for the demonstrated fixes | Extract cohesive service operations as those areas change, retaining HTTP/transaction regression coverage                                |
| Low                          | Toolchain deprecations              | Prisma package-config, Vite config-loader and upstream icon/lint warnings remain; current supported versions install/build/test              | Track upstream migrations in routine maintenance; do not suppress warnings or change majors solely for cosmetic output                   |

No claim is made that missing external verification is successful. The credential-dependent items are the concrete boundary to further production certification in this environment.

## 15. Exact commands used

The verification commands below were run from the repository root. Logs were redirected to ignored `.local/audit/*.log` files. Dependency/Prisma commands load private environment variables without printing their values. Do not run test resets against shared databases.

```bash
npm ci --no-fund
npm run db:local
npm run db:generate
npm run db:validate
npm run db:check-migrations
npm ls --all --json
npm audit --json
npm run format
npm run format:check
npm run security:check
npm run lint
npm run typecheck
npm run test:coverage
NX_DAEMON=false npm run test:frontend
npm run test:integration -- --coverage --reporter=verbose
NX_DAEMON=false npm run build
npm run test:ssr
npm run test:e2e
npm run test:performance
node tools/vercel/package.mjs
git diff --check
```

Targeted regression commands used while fixing failures:

```bash
npm run test:integration -- tests/integration/hosting.spec.ts
npm run test:integration -- tests/integration/hardening.spec.ts -t 'database timezones'
npm run test:integration -- tests/integration/hardening.spec.ts -t 'database timezone'
npm run test:integration -- tests/integration/hardening.spec.ts -t 'durably retries'
```

The hosting command first demonstrated 503 after account creation; its regression subsequently passed in the full suite. The first timezone test demonstrated zero reported expiry for a 60-second window; the corrected tests passed in both selected zones. Normal exploratory commands included `rg --files`, `rg -n`, `git status --short`, `git diff --stat`, and dependency package-manifest reads. Read-only Node/Prisma/TLS inspectors produced the Neon/source-graph evidence listed below; no deployment command was run.

Run integration and the performance fixture sequentially because they share the local test database. E2E uses a separate database. Build before starting E2E; do not replace `dist` while browser tests are running. Coverage directories are now independent.

## 16. Final verification results

| Check                                       | Result/evidence                                                                                   |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Clean install/lockfile/peers                | Pass; `npm ci --no-fund`, dependency-tree final JSON                                              |
| Dependency audit                            | Zero reported vulnerabilities; dependency-final JSON                                              |
| Prisma generation/validation                | Pass                                                                                              |
| Complete migration replay/schema comparison | Pass; eight migrations locally                                                                    |
| Neon connections/TLS/schema comparison      | Read-only pass; TLS 1.3; only the two pending additive migrations                                 |
| Format, lint, strict type checking          | Pass                                                                                              |
| Domain, frontend, HTTP/integration coverage | 32 + 31 + 66 tests pass; unchanged thresholds                                                     |
| Web/admin/API production builds             | Pass; separate app outputs                                                                        |
| SSR/cache verification                      | Pass                                                                                              |
| Production browser flows/layout/axe         | 12 suites pass; final rerun evidence in `e2e-final.log`                                           |
| Vercel packaging                            | Pass locally; 23.9 MiB API function; not deployed                                                 |
| Source/artifact secret scans                | Pass; no configured-secret matches                                                                |
| Runtime/browser errors                      | No unexpected page errors in checked routes/flows; expected injected failures tested for recovery |
| Working-tree safety                         | `git diff --check` passes; `.env`/`.local` remain ignored                                         |

Final local dashboard samples: one habit/90 logs took 48, 13, 9 ms; one hundred habits/9,000 logs took 109, 96, 111 ms. Each sample made 17 queries. `EXPLAIN ANALYZE` selected `HabitLog_userId_createdAt_idx`, returned all 100 expected current-day fixture logs, and took 0.087 ms in the final plan sample.

The final Chromium measurement at 2026-09-28T18:09:41.227Z used disabled browser cache, 4x CPU throttling and no network throttle. Dashboard readiness was 1135 ms, LCP 628 ms, CLS 0, DOMContentLoaded 233 ms and load 244 ms. Resources transferred 815,311 bytes. There was one dashboard request, plus session and announcement reads. These are local single-run measurements, not production service levels.

Evidence is retained locally in ignored `.local/audit/`: installation/build/test logs, `dependency-final.json`, `dependency-tree-final.json`, `compatibility-final.jsonl`, `neon-readonly.json`, `neon-tls.json`, `neon-schema-diff.sql`, `source-graph.json`, `project-graph.json`, `api-performance.json`, and sixty route screenshots/contact sheets. Browser measurements are in `.local/performance.json`; coverage in `coverage/domain` and `coverage/api`; Playwright diagnostics in `playwright-report`/`test-results`. These artifacts may contain private fixture data and must not be committed or published as documentation assets.
