-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "empresa" TEXT,
    "cargo" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "emailExtra" TEXT,
    "indicadoPorId" TEXT,
    "origem" TEXT,
    "tags" TEXT,
    "notas" TEXT,
    "responsavel" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cliente_passos" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "concluido" BOOLEAN NOT NULL DEFAULT false,
    "posicao" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "concluidoEm" TIMESTAMP(3),

    CONSTRAINT "cliente_passos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_messages" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT,
    "sessionId" TEXT,
    "jid" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "texto" TEXT,
    "mediaUrl" TEXT,
    "mediaType" TEXT,
    "mensagemId" TEXT,
    "enviadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsapp_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "clientes_telefone_idx" ON "clientes"("telefone");
CREATE INDEX "clientes_email_idx" ON "clientes"("email");
CREATE INDEX "cliente_passos_clienteId_idx" ON "cliente_passos"("clienteId");
CREATE UNIQUE INDEX "whatsapp_messages_mensagemId_key" ON "whatsapp_messages"("mensagemId");
CREATE INDEX "whatsapp_messages_jid_idx" ON "whatsapp_messages"("jid");
CREATE INDEX "whatsapp_messages_clienteId_idx" ON "whatsapp_messages"("clienteId");

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_indicadoPorId_fkey" FOREIGN KEY ("indicadoPorId") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "cliente_passos" ADD CONSTRAINT "cliente_passos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "whatsapp_messages" ADD CONSTRAINT "whatsapp_messages_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
