# Progression without pressure

MIRHAL rewards showing up. Missing a day is information; Habit Lab and recovery prompts help the user choose a smaller next step. Streaks never replace broader adherence or reflection.

XP transactions are append-only credits/debits with type, source, amount, time and idempotency key. Available balance is credits minus debits. Lifetime earned XP excludes reward refunds and stays independent from spending; levels therefore do not fall when a reward is redeemed. Level configuration is database data.

Habit difficulty determines full-action XP, with a smaller valid award for a minimum action. Tasks, check-ins, quests, achievements and finished challenges have separate award sources. The server calculates every award. Reopening and re-completing work cannot farm duplicate XP.

Achievements are server-evaluated configured conditions: total habit actions/check-ins/quests/challenges or consecutive scheduled days. Hidden achievements stay hidden until unlocked. A shared progress function serves both unlock decisions and the achievement screen.

Rewards may be global or personal. Redemption locks the user, checks balance/limits, creates the redemption and debit atomically, and deduplicates replay keys. A five-minute undo creates a compensating credit; it never edits the ledger. Personal enjoyment is part of progress, not a penalty or coercion mechanism.

Journey Score weights are defined in `libs/domain/src/progress.ts` and returned as visible contributions. Challenge scores are a separate metric governed by the agreed rules; personal spending does not alter competition results.

A new level is included in the successful action response only when committed lifetime XP crosses a configured threshold. Duplicate actions cannot replay the celebration. Notification text is generated in the recipient's profile language at delivery time; existing notification records retain their original language.
