# Private, fair challenges

Challenges support whole-life, life-area and specific-habit scopes, with score, consistency, improvement, target, streak and cooperative modes. Only accepted friends can be invited; acceptance checks that the friendship is still valid.

The lifecycle stores draft/invited/accepted/scheduled/active/completed/cancelled states. Once all invitees accept and the start arrives, activation captures rules, version, timezone, baseline and eligible habits. Units cannot change while the habit participates in an active challenge. Changes to live area/schedule/reward settings do not rewrite snapshots.

Scoring uses only server-recorded observations within the challenge interval and eligible frozen schedules. Dates use the frozen timezone and one observation per habit/day. Daily caps apply after aggregation. XP competition uses earned eligible habit credits and caps them by the captured reward, never spendable wallet balance.

Improvement compares percentage change from each participant's baseline. It requires a single daily habit and at least seven historical observations. Missing days never count as lower-is-better improvement. Zero or absent baselines produce no artificial advantage. Cooperative progress combines contributions only when all relevant participants permit progress sharing.

Finalization is atomic and serialized. Final scores include the algorithm version and a SHA-256 evidence hash, become immutable, and can issue idempotent completion rewards/achievements. Cancellation does not rewrite personal progress.

Participants control score, percentage and streak sharing. Exact counts, another person's baseline, habit descriptions, mood and private journals are excluded from social payloads. Blocked connections receive neither the blocked person's profile detail nor their score.
