ALTER TABLE "representacoes" ADD COLUMN "razaoSocial" TEXT;
ALTER TABLE "representacoes" ADD COLUMN "endereco" TEXT;

CREATE TABLE "contatos_representacao" (
    "id" TEXT NOT NULL,
    "representacaoId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cargo" TEXT,
    "email" TEXT,
    "telefone" TEXT,
    "observacoes" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "contatos_representacao_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "contatos_representacao_representacaoId_idx" ON "contatos_representacao"("representacaoId");
ALTER TABLE "contatos_representacao" ADD CONSTRAINT "contatos_representacao_representacaoId_fkey" FOREIGN KEY ("representacaoId") REFERENCES "representacoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
