-- AlterTable
ALTER TABLE "ChallengeParticipant" ADD COLUMN     "timezoneSnapshot" TEXT;

-- CreateTable
CREATE TABLE "ChallengeHabitSnapshot" (
    "participantId" TEXT NOT NULL,
    "habitId" TEXT NOT NULL,
    "target" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "xpReward" INTEGER NOT NULL,
    "frequency" "HabitFrequency" NOT NULL,
    "scheduleDays" INTEGER[],
    "weeklyTarget" INTEGER NOT NULL,
    "startDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChallengeHabitSnapshot_pkey" PRIMARY KEY ("participantId","habitId")
);

-- CreateIndex
CREATE INDEX "ChallengeHabitSnapshot_habitId_idx" ON "ChallengeHabitSnapshot"("habitId");

-- AddForeignKey
ALTER TABLE "ChallengeHabitSnapshot" ADD CONSTRAINT "ChallengeHabitSnapshot_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "ChallengeParticipant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeHabitSnapshot" ADD CONSTRAINT "ChallengeHabitSnapshot_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "Habit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Preserve eligibility for challenges created before snapshot support. Existing final
-- results remain untouched; this backfill cannot reconstruct historical habit edits.
INSERT INTO "ChallengeHabitSnapshot" ("participantId", "habitId", target, unit, "xpReward", frequency, "scheduleDays", "weeklyTarget", "startDate")
SELECT p.id, h.id, h.target, h.unit, h."xpReward", h.frequency, h."scheduleDays", h."weeklyTarget", h."startDate"
FROM "ChallengeParticipant" p JOIN "Challenge" c ON c.id = p."challengeId"
JOIN "Habit" h ON h."userId" = p."userId"
WHERE c."activatedAt" IS NOT NULL AND h.status = 'ACTIVE'
AND (p."habitId" IS NULL OR p."habitId" = h.id)
AND (c."areaId" IS NULL OR c."areaId" = h."areaId");
-- Existing baseline trigger must be extended after timezone backfill.
UPDATE "ChallengeParticipant" p SET "timezoneSnapshot" = COALESCE(pr.timezone, 'UTC')
FROM "Profile" pr, "Challenge" c
WHERE pr."userId" = p."userId" AND c.id = p."challengeId" AND c."activatedAt" IS NOT NULL;

ALTER TABLE "ChallengeHabitSnapshot" ADD CONSTRAINT snapshot_values_valid CHECK
(target > 0 AND "xpReward" > 0 AND "weeklyTarget" BETWEEN 1 AND 7);
CREATE FUNCTION lifequest_freeze_eligibility() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE activated TIMESTAMP;
BEGIN
  IF TG_OP <> 'INSERT' THEN RAISE EXCEPTION 'Challenge eligibility snapshots are immutable'; END IF;
  SELECT c."activatedAt" INTO activated FROM "Challenge" c
  JOIN "ChallengeParticipant" p ON p."challengeId" = c.id WHERE p.id = NEW."participantId" FOR UPDATE OF c;
  IF activated IS NOT NULL THEN RAISE EXCEPTION 'Cannot add habits after challenge activation'; END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER challenge_frozen_eligibility BEFORE INSERT OR UPDATE OR DELETE ON "ChallengeHabitSnapshot"
FOR EACH ROW EXECUTE FUNCTION lifequest_freeze_eligibility();
CREATE FUNCTION lifequest_freeze_configuration() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD."activatedAt" IS NOT NULL AND (
    NEW.mode IS DISTINCT FROM OLD.mode OR NEW.scope IS DISTINCT FROM OLD.scope OR
    NEW."areaId" IS DISTINCT FROM OLD."areaId" OR NEW."startDate" IS DISTINCT FROM OLD."startDate" OR
    NEW."endDate" IS DISTINCT FROM OLD."endDate" OR NEW."activatedAt" IS DISTINCT FROM OLD."activatedAt" OR
    NEW."algorithmVersion" IS DISTINCT FROM OLD."algorithmVersion") THEN
    RAISE EXCEPTION 'Active challenge scoring configuration is immutable';
  END IF;
  IF OLD.status IN ('COMPLETED', 'CANCELLED') AND NEW.status IS DISTINCT FROM OLD.status THEN
    RAISE EXCEPTION 'Ended challenges cannot be reopened';
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER challenge_frozen_configuration BEFORE UPDATE ON "Challenge"
FOR EACH ROW EXECUTE FUNCTION lifequest_freeze_configuration();
CREATE OR REPLACE FUNCTION lifequest_freeze_baseline() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF (OLD."baselineEnd" IS NOT NULL OR OLD."timezoneSnapshot" IS NOT NULL) AND (
    NEW.baseline IS DISTINCT FROM OLD.baseline OR NEW."baselineStart" IS DISTINCT FROM OLD."baselineStart" OR
    NEW."baselineEnd" IS DISTINCT FROM OLD."baselineEnd" OR NEW."habitId" IS DISTINCT FROM OLD."habitId" OR
    NEW."timezoneSnapshot" IS DISTINCT FROM OLD."timezoneSnapshot" OR NEW."userId" IS DISTINCT FROM OLD."userId" OR
    NEW."challengeId" IS DISTINCT FROM OLD."challengeId") THEN
    RAISE EXCEPTION 'Baseline snapshots are immutable';
  END IF;
  RETURN NEW;
END; $$;
CREATE FUNCTION lifequest_freeze_metric() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM "Challenge" WHERE id = OLD."challengeId" AND "activatedAt" IS NOT NULL) THEN
    RAISE EXCEPTION 'Active challenge metrics are immutable';
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER challenge_frozen_metric BEFORE UPDATE OR DELETE ON "ChallengeMetric"
FOR EACH ROW EXECUTE FUNCTION lifequest_freeze_metric();
CREATE TRIGGER challenge_frozen_rule_delete BEFORE DELETE ON "ChallengeRule"
FOR EACH ROW EXECUTE FUNCTION lifequest_freeze_metric();
