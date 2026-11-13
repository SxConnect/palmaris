-- CreateTable
CREATE TABLE "scheduled_campaigns" (
    "id" TEXT NOT NULL,
    "fromEmail" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "recipients" TEXT NOT NULL,
    "delaySec" INTEGER NOT NULL DEFAULT 2,
    "batchSize" INTEGER NOT NULL DEFAULT 0,
    "warmUp" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "totalCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scheduled_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "scheduled_campaigns_status_scheduledAt_idx" ON "scheduled_campaigns"("status", "scheduledAt");
