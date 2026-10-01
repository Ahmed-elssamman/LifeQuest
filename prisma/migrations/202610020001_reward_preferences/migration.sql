-- Additive reward preference, feedback, and savings foundations.
ALTER TABLE "Reward" ADD COLUMN "contexts" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "cooldownDays" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "RewardRedemption" ADD COLUMN "ratedAt" TIMESTAMP(3),
ADD COLUMN "rating" INTEGER;

CREATE TABLE "RewardFavorite" (
    "userId" TEXT NOT NULL,
    "rewardId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RewardFavorite_pkey" PRIMARY KEY ("userId","rewardId")
);

CREATE TABLE "RewardSavingsTarget" (
    "userId" TEXT NOT NULL,
    "rewardId" TEXT NOT NULL,
    "targetXp" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RewardSavingsTarget_pkey" PRIMARY KEY ("userId","rewardId")
);

CREATE INDEX "RewardSavingsTarget_userId_createdAt_idx" ON "RewardSavingsTarget"("userId", "createdAt");

ALTER TABLE "RewardFavorite" ADD CONSTRAINT "RewardFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RewardFavorite" ADD CONSTRAINT "RewardFavorite_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "Reward"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RewardSavingsTarget" ADD CONSTRAINT "RewardSavingsTarget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RewardSavingsTarget" ADD CONSTRAINT "RewardSavingsTarget_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "Reward"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Reward" ADD CONSTRAINT "reward_cooldown_days_range" CHECK ("cooldownDays" BETWEEN 0 AND 365);
ALTER TABLE "RewardRedemption" ADD CONSTRAINT "reward_rating_range" CHECK ("rating" IS NULL OR "rating" BETWEEN 1 AND 5);
ALTER TABLE "RewardRedemption" ADD CONSTRAINT "reward_rating_timestamp_pair" CHECK (("rating" IS NULL) = ("ratedAt" IS NULL));
ALTER TABLE "RewardSavingsTarget" ADD CONSTRAINT "reward_savings_target_range" CHECK ("targetXp" BETWEEN 50 AND 100000);
