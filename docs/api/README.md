# REST API

The root is `/api`. Development OpenAPI at `/api/docs` and JSON at `/api/docs-json` document validated bodies, query parameters, auth, roles and error responses from the same schemas used at runtime.

Authenticate through `/auth/register` or `/auth/login`; the response sets the HttpOnly `lq_session` cookie. Use credentials-aware HTTP and send the configured Origin on every mutation. `/auth/me`, `/auth/refresh`, `/auth/logout`, `/auth/logout-all`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/verify-email` and `/auth/resend-verification` cover the identity lifecycle. Never put tokens in browser storage.

Resource families include `/goals`, `/projects`, `/tasks`, `/milestones`, `/habits`, `/habits/:id/complete`, `/habits/:id/experiments`, `/check-ins`, `/quests`, `/xp`, `/achievements`, `/rewards`, `/redemptions`, `/friends`, `/challenges`, `/notifications`, `/feedback`, `/dashboard`, `/analytics`, `/journey`, `/profile` and `/account/*`.

Paginated collections return `{ items, total, page, limit, pages }`; limits are capped at 100. Search/filter parameters are server-side. Some smaller read models currently return bounded arrays; consult endpoint behavior before building infinite scrolling.

Errors follow `{ code, message, details?, requestId, timestamp }`. Validation details contain field paths and safe messages. Missing owned objects return 404. Role/origin violations return 403. Duplicates/conflicts use 409 where appropriate. Logs retain correlation IDs without request bodies or credentials.

POST habit completion is idempotent per habit/local day. Reward redemption requires a UUID idempotency key; reuse it for retries. Clients never submit XP, achievement unlock decisions or challenge scores. Challenge refresh requests trigger server calculation only.

Administration lives at `/admin/*`. SUPER_ADMIN manages roles; ADMIN manages operations, MODERATOR challenges/feedback, SUPPORT people/feedback, CONTENT_MANAGER catalogs and ANALYST permitted metrics/audit. Server decorators enforce the exact permissions. Sensitive mutations create append-only audit events.
