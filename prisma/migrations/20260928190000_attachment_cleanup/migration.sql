CREATE TABLE "AttachmentDeletion" (
    "storageKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "retryAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AttachmentDeletion_pkey" PRIMARY KEY ("storageKey")
);

CREATE INDEX "AttachmentDeletion_retryAt_createdAt_idx" ON "AttachmentDeletion"("retryAt", "createdAt");
