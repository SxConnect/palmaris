-- CreateTable
CREATE TABLE "emails_recebidos" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT,
    "de" TEXT NOT NULL,
    "deNome" TEXT,
    "para" TEXT,
    "subject" TEXT,
    "preview" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL,
    "mensagemId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emails_recebidos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "emails_recebidos_mensagemId_key" ON "emails_recebidos"("mensagemId");
CREATE INDEX "emails_recebidos_clienteId_idx" ON "emails_recebidos"("clienteId");
CREATE INDEX "emails_recebidos_de_idx" ON "emails_recebidos"("de");
