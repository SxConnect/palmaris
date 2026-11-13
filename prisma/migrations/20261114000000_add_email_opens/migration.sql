-- CreateTable
CREATE TABLE "email_opens" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT,
    "recipient" TEXT NOT NULL,
    "trackingId" TEXT NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userAgent" TEXT,
    "ip" TEXT,

    CONSTRAINT "email_opens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_opens_trackingId_key" ON "email_opens"("trackingId");

-- CreateIndex
CREATE INDEX "email_opens_campaignId_idx" ON "email_opens"("campaignId");

-- CreateIndex
CREATE INDEX "email_opens_recipient_idx" ON "email_opens"("recipient");
