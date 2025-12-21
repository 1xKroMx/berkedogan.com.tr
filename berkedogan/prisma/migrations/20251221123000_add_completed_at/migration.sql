-- Add completedAt timestamp for task completion tracking
ALTER TABLE "tasks"
ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMPTZ;
