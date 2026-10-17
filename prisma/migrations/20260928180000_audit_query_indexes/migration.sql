-- Index relation lookups, challenge evidence, and expired session cleanup.
CREATE INDEX "Milestone_goalId_idx" ON "Milestone" ("goalId");
CREATE INDEX "Milestone_projectId_idx" ON "Milestone" ("projectId");
CREATE INDEX "Task_goalId_idx" ON "Task" ("goalId");
CREATE INDEX "Task_parentId_idx" ON "Task" ("parentId");
CREATE INDEX "FeedbackReply_feedbackId_createdAt_idx" ON "FeedbackReply" ("feedbackId", "createdAt");
CREATE INDEX "FeedbackAttachment_feedbackId_idx" ON "FeedbackAttachment" ("feedbackId");
CREATE INDEX "HabitLog_userId_createdAt_idx" ON "HabitLog" ("userId", "createdAt");
CREATE INDEX "Session_expiresAt_idx" ON "Session" ("expiresAt");
CREATE INDEX "AuthToken_expiresAt_idx" ON "AuthToken" ("expiresAt");
