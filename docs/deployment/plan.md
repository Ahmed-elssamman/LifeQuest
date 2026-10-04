# Implementation plan

1. Preserve the Nx, session, Prisma, and inline bilingual architectures. Validate environment at API startup and keep private variables backend-only.
2. Extend the existing `MailAdapter` behind a provider interface. Keep test and development outboxes, add configured SMTP for local Gmail and one documented transactional HTTP API provider for production.
3. Render existing verification and reset messages in Arabic and English, selected from persisted `Profile.language` with Arabic fallback. Make new registrations Arabic by default and allow explicit language selection.
4. Add safe delivery timeouts, classification, logging, and duplicate-send protection without an in-memory reliability promise. Keep existing auth APIs compatible.
5. Add Render build/start configuration and use the existing `/api/health`, shutdown hooks, and Prisma migration command. Keep the browser's `/api` contract by routing Vercel `/api` to Render.
6. Audit remaining pages, RTL/LTR, security, and responsive behavior. Run fresh builds, unit, integration, browser, migration, and source-safety checks after changes.
7. Document exact local and production steps. Production deployment and real email smoke checks require owned accounts, secrets, domains, and DNS.

Each phase closes only after relevant checks pass; unresolved external gates are recorded as blocked, not passed.
