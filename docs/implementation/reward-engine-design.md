# Reward engine phase 4 design

Status: implemented and verified locally. The existing Reward, RewardRedemption and append-only XP transaction behavior remain authoritative. Production migration deployment remains a separate release action.

## Existing contracts and dependency review

- `RewardsService.redeem` locks the user through `Database.atomic`, checks an owned or global active reward, checks available XP and redemption limits, then creates the redemption and ledger debit atomically. Replay keys prevent duplicate spending. A five-minute refund creates a compensating credit.
- The customer reward page already lists paginated rewards, creates personal rewards and shows redemption history. Staff can create/update global rewards through the protected content controller. Seeded global categories include legacy labels and must remain valid.
- Account erasure anonymizes personal reward text while retaining pseudonymous redemption and XP evidence. New preference and savings rows must be deleted; ratings and optional contexts must be cleared on erasure.
- Existing `rewardSchema` is shared by personal and staff creation. Optional additions must have safe defaults. New owned operations require explicit user/reward checks.

## Incremental V1

1. Add optional reward recurrence (`cooldownDays`) and preferred time contexts to `Reward`; add optional 1–5 rating/time to `RewardRedemption`. Add `RewardFavorite` and `RewardSavingsTarget` as user-owned join records with unique user/reward pairs. Preserve current IDs, routes, ledger and refund semantics. Additive migration only.
2. Expose personal reward update/activation, favorite, savings-target and redemption feedback routes. Apply ownership checks in the service and strict Zod validation in controllers. Enforce cooldown under the existing user lock. Staff global reward writes retain their role checks.
3. Derive a `RewardPreferenceProfile` projection from the user's own favorites, non-refunded redemptions and optional ratings. Keep it in a bounded recommendation service rather than storing a speculative personality profile. Score active accessible rewards using category affinity, explicit favorite, satisfaction, recency, current time context, affordability and a small discovery factor. Return a short, non-creepy reason. Avoid ML and extra dashboard requests.
4. Reuse the current reward page for category choice, favorites, savings progress, recommendations and optional post-redemption rating. Keep global and personal rewards accessible through the existing list. Show honest wallet balance; savings targets are watch goals, not reserved XP. A redemption elsewhere can change available balance, but no accumulated XP or level is taken away.

The preference profile is derived on request from the latest 100 non-refunded redemptions, their optional ratings and the user's explicit favorites. Suggestions are limited to four of the first 100 accessible active rewards ordered by cost. Low ratings reduce category affinity. Reasons are returned as stable codes and translated in the web app. The cap keeps reward work off the Today/Home request path; a larger catalog would need a measured retrieval strategy.

Local verification: Prisma validation and isolated local migration replay; 42 unit tests, 31 Angular tests, 67 integration tests, 15 browser tests, all three builds, lint, typecheck and source safety passed. The baseline Vite config warning remains.

## Migration and rollback

Generate SQL from a schema diff and replay only against the isolated local PostgreSQL instance. Both `.env` runtime and direct URLs currently target Neon; **never run migrate dev/deploy with the default environment for this phase**. Verify host `127.0.0.1` before any schema application. Do not edit earlier migrations. After release, rollback code per endpoint/UI section; preserve additive tables/columns until a later reviewed migration. Do not delete ledger or redemption history.

## Deferred scope

Goal/season/achievement affinity, exact context beyond time of day, learning from sensitive personal data, AI/ML and a separate preference warehouse have no current consumer. Design service inputs so these signals can be added later without changing the reward and redemption contracts.
