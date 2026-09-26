# Backend

Bootstrap configures Helmet, strict origin allowlists, a 64 KB JSON limit, HttpOnly cookies, request IDs, structured timing logs, global rate limiting and safe exception responses. All writes require an approved Origin header. Session and role guards protect routes by default; public endpoints require explicit metadata.

Passwords use Argon2id. Random opaque session tokens are hashed before storage. Sessions expire after one hour and can renew while active, with a seven-day absolute lifetime. Parallel tabs extend the same session rather than racing token rotations. Password reset tokens are hashed, single-use and expire after 30 minutes; successful resets revoke all existing sessions. Verification tokens expire after one day.

Strict shared schemas reject mass assignment and client-provided XP/scores. PATCH validators remove creation defaults so omitted fields are unchanged. `assertReferences` verifies ownership of linked entities and consistent project/goal relationships. Explicit DTO validation also generates OpenAPI bodies/query descriptions.

XP is an append-only ledger. `Database.atomic` locks a user row before XP-bearing actions. Idempotency keys prevent duplicate awards; spending and refunds happen in the same transaction as redemptions. Achievement progress is shared between read and unlock paths.

Challenge lifecycle and scoring are separate services. Activation captures rules, eligible habits, schedule/unit/reward values, baseline and timezone. Immutable snapshots stop later habit edits from changing eligibility. Final results record a deterministic evidence hash and algorithm version. The simple in-process minute timer processes pending lifecycles; no Redis or external queue is required. Multiple API instances remain safe through row locks.

Notifications honor account preferences. Social serialization exposes only allowed aggregate progress and hides exact observations, baselines of other users, mood and journals. Admin endpoints select privacy-safe fields and write append-only audit entries.

Development mail is private local output. SMTP uses verified TLS and safe error messages. Log only request IDs, path, status, duration and safe error codes; never bodies, tokens, cookies, database strings or passwords.
