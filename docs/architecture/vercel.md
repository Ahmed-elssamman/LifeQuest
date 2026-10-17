# Legacy Vercel function deployment

This page describes the earlier Vercel-hosted API deployment. It is retained for operators of that existing installation. The MIRHAL production target is **Vercel frontends + Render API + Neon + Resend**; use the current [deployment guide](../deployment/README.md) and `npm run vercel:package:render` for that architecture. Do not run `vercel:configure` for the Render deployment: it configures this legacy function and disables email.

The earlier installation uses two separate Vercel projects. The customer project serves Angular's prerendered public pages, lazy client routes, and a NestJS function under `/api`. The administration project contains only the admin frontend and proxies `/api` to the customer project's production origin. Host-only HttpOnly cookies keep each application's session separate. Both origins must be explicitly allowed by the API.

`apps/api/src/serverless.ts` initializes Nest once per warm instance without listening on a port or starting timers. PostgreSQL remains on Neon. Only the pooled `DATABASE_URL` is installed in Vercel; `DIRECT_URL` is used privately for migrations before deployment. Prisma includes the Vercel Linux/OpenSSL engine. Argon2's Linux native binding is traced into the function.

Feedback images use a **private Vercel Blob store** attached to the customer project. The API checks owner/staff authorization before streaming an image, and limits each file to 2 MiB. Local development and tests retain the filesystem adapter. Production never falls back to an ephemeral filesystem.

Rate limits use atomic PostgreSQL counters shared across function instances. Only Vercel's overwritten client-address header is trusted inside Vercel. Counter keys are hashed. The protected daily maintenance endpoint removes expired counters/sessions/tokens and advances challenges. Challenge reads also advance participants' due challenges. The Hobby plan's daily cron is a fallback; unattended transitions are not guaranteed to occur at the exact scheduled minute.

## Initial setup

Use Node 24, the npm lockfile, and an authenticated Vercel CLI. Create two projects, then link ignored staging directories:

```sh
mkdir -p .local/vercel/web .local/vercel/admin
vercel link --project YOUR_WEB_PROJECT --cwd .local/vercel/web --yes
vercel link --project YOUR_ADMIN_PROJECT --cwd .local/vercel/admin --yes
vercel blob create-store lifequest-feedback --access private --region iad1 --environment production --cwd .local/vercel/web --yes
```

Set `VERCEL_WEB_ORIGIN` and `VERCEL_ADMIN_ORIGIN` to the actual HTTPS production aliases in private `.env`. Existing `DATABASE_URL` and `DIRECT_URL` must also be present. Never commit environment files. Blob provisioning installs `BLOB_READ_WRITE_TOKEN` directly in the customer project. Configuration generates a private `CRON_SECRET` if missing and passes values through CLI stdin, without logging them. No database or Blob credential belongs in admin/browser configuration.

```sh
npm ci
npm run db:generate
npm run db:deploy
npm run vercel:configure
npm run vercel:package
vercel deploy --prebuilt --prod --yes --cwd .local/vercel/web
vercel deploy --prebuilt --prod --yes --cwd .local/vercel/admin
npm run vercel:verify
```

`vercel:package` builds all three applications, then writes Build Output API v3 artifacts. `tools/vercel/package.mjs` reads `VERCEL_WEB_ORIGIN` from the shell or `.env`. It preserves project links, copies browser assets, traces only the API's dependencies, rejects environment files, and enforces a function size budget. Public HTML is prerendered; private routes load the client shell. Hashed assets are immutable, HTML revalidates, and API responses are never cached.

`vercel:verify` runs actual browser interactions against production. It creates a temporary account, completes onboarding, creates linked work, completes a habit/check-in/quest, redeems a reward, uploads/downloads a private image, and exercises admin feedback. It removes its temporary account and images afterward. Configure `DEMO_ADMIN_EMAIL` and `DEMO_ADMIN_PASSWORD` privately to verify the existing administrator. The test never prints credentials. `tools/browser-smoke.mjs` additionally checks seeded customer/admin pages using private demo credentials.

## Email delivery

This deployment intentionally uses `MAIL_MODE=disabled`. Registration and login work; email stays unverified and no recovery/verification token is generated or delivery claimed. Recovery and resend return a clear unavailable response. The UI explains this before registration and on recovery/security screens.

To enable email later, configure SMTP variables from `.env.example`, `APP_URL`, and change `MAIL_MODE` in the customer project's environment, then redeploy. The configuration script explicitly selects disabled mode for this deployment; adjust that script before using it for a deployment requiring SMTP. No external provider is needed for development.

## Operations and limits

- Run migrations and required checks before deploying. No automatic production deployment is configured.
- Keep production aliases stable; update both API CORS origins and the admin rewrite when they change.
- Function region is `iad1`, runtime Node 24, maximum invocation duration 60 seconds. The API artifact is about 24 MiB uncompressed.
- Maintenance is authenticated with `Authorization: Bearer <CRON_SECRET>`. Never include its real value in a URL or logs.
- Private Blob access and API authorization are separate requirements. Never make the store public.
- Local uploads created before migration to Vercel need an explicit private upload migration if any exist; creating a Blob store does not copy old files.
- Preview deployment access follows Vercel project protection. App authorization still protects private application/API routes on the public production alias.
