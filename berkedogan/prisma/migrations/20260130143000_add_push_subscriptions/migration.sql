CREATE TABLE IF NOT EXISTS "push_subscriptions" (
  "id" SERIAL PRIMARY KEY,
  "endpoint" TEXT NOT NULL UNIQUE,
  "subscription" JSONB NOT NULL,
  "p256dh" TEXT,
  "auth" TEXT,
  "expirationTime" TIMESTAMPTZ,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "push_subscriptions_active_idx" ON "push_subscriptions" ("isActive");
