# ADR 003: Explicit validation, dependency injection and static offline support

Accepted. Strict Zod contracts validate every external body/query. OpenAPI derives request schemas from those same validators. PATCH schemas remove creation defaults before making fields optional, because Zod 4 otherwise evaluates nested defaults on absent fields.

NestJS injection uses explicit `@Inject` tokens. Generated design-type reflection metadata is disabled consistently in production and integration builds; it adds no value to this validation/DI approach. Source coverage measures application branches without unnecessary generated type checks.

PWA support caches only public/static application assets. Private API responses and mutations are excluded, so offline replay cannot duplicate XP or scores. A richer offline personal-data store needs a separate privacy and conflict-resolution design.
