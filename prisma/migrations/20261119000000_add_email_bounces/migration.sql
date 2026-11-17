-- CreateTable
CREATE TABLE "email_bounces" (
    "id" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "reason" TEXT,
    "bouncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_bounces_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "email_bounces_recipient_idx" ON "email_bounces"("recipient");
