-- CreateTable
CREATE TABLE "email_sends" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT,
    "recipient" TEXT NOT NULL,
    "subject" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trackingId" TEXT NOT NULL,

    CONSTRAINT "email_sends_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_sends_trackingId_key" ON "email_sends"("trackingId");

-- CreateIndex
CREATE INDEX "email_sends_recipient_idx" ON "email_sends"("recipient");

-- CreateIndex
CREATE INDEX "email_sends_campaignId_idx" ON "email_sends"("campaignId");
