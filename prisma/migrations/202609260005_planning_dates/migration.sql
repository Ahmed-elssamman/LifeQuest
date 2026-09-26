ALTER TABLE "Goal" ADD CONSTRAINT goal_date_order
  CHECK ("startDate" IS NULL OR "targetDate" IS NULL OR "startDate" <= "targetDate");
ALTER TABLE "Project" ADD CONSTRAINT project_date_order
  CHECK ("startDate" IS NULL OR "deadline" IS NULL OR "startDate" <= "deadline");
ALTER TABLE "Task" ADD CONSTRAINT task_date_order
  CHECK ("startDate" IS NULL OR "dueDate" IS NULL OR "startDate" <= "dueDate");
