# Future health integration boundary

Status: architecture decision only. MIRHAL has no personal health provider connection, OAuth flow, imported health data, or health based recommendation today. The existing admin “health” page concerns service health and configuration.

## Where an integration would fit

Keep provider communication on the NestJS server. A future provider adapter would authenticate for one consenting user, request a narrowly selected data type and time window, and return normalized observations with the provider name, opaque source record ID, measured time, source timezone, unit and import time. A domain service would validate and store those observations behind user ownership checks. Provider adapters must not write HabitLog, DailyCheckIn, XPTransaction or challenge scores directly.

HabitLog represents an intentional recorded behavior; DailyCheckIn represents reflection. Neither is a generic sensor record. Linking an imported observation to a habit or awarding XP would require an explicit user choice, provenance display, duplicate protection and separate product review. The current schema has no safe place for that provenance, so adding columns or tables now would be speculative.

## Privacy and consent

- Require separate, revocable consent for each provider and data category. Explain the exact use before connecting.
- Default imported observations to private. Never include exact health values in friends, challenge, public profile, notification or admin list responses. Aggregate challenge sharing would need a separate consent and privacy review.
- Keep provider tokens encrypted server side and out of client bundles, logs, analytics, exports and error messages. Define token expiry, rotation and disconnection behavior before implementing OAuth.
- Account export and deletion must include or remove imported observations and provider credentials. Revocation must stop future syncs; deletion must account for retention obligations without exposing data.
- Use source IDs plus provider/user uniqueness to prevent duplicate imports. Record corrections and deletions from providers. Preserve source time and timezone so daily summaries do not shift across day boundaries.
- Store only measurements that a user selected and that a shipped feature actually consumes. Define retention and data minimization before adding a provider.

## Implementation gate

Choose one real provider and one user benefit first. Then review its terms, scopes, webhook/polling model, data precision and deletion rules. Add a narrow adapter contract, owned schema and additive Prisma migration, followed by authorization, replay, timezone, export/deletion and failure tests. Keep sync work away from the Today request path. HealthKit and Health Connect would additionally require a justified native/mobile path; none is assumed here.

Possible future providers include HealthKit, Health Connect, Oura, Garmin, Polar and Fitbit. This document makes no claim that any provider is connected or approved.
