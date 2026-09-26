# ADR 002: Row locks, append-only ledgers and frozen challenge evidence

Accepted. A modular NestJS application and PostgreSQL transactions are sufficient for the current product. User row locks serialize XP-bearing mutations; deterministic challenge/user lock ordering protects activation and finalization. This avoids a distributed lock service and keeps retries auditable.

XP and audit records are append-only. Refunds create compensating entries. Habit/day and idempotency uniqueness provide a second integrity boundary beneath application checks.

Challenges capture eligible habits, schedules, targets, reward/unit settings, timezone and baseline. Database triggers freeze those records and final scores. This costs a small amount of normalized snapshot data but prevents later edits from changing agreed competition rules.
