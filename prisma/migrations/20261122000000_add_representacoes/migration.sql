-- CreateTable representacoes
CREATE TABLE "representacoes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logoUrl" TEXT,
    "descricao" TEXT,
    "segmento" TEXT,
    "site" TEXT,
    "emailContato" TEXT,
    "telefone" TEXT,
    "responsavel" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ativa',
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "representacoes_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "representacoes_nome_key" ON "representacoes"("nome");
CREATE UNIQUE INDEX "representacoes_slug_key" ON "representacoes"("slug");

-- CreateTable produtos
CREATE TABLE "produtos" (
    "id" TEXT NOT NULL,
    "representacaoId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "categoria" TEXT,
    "imagens" TEXT,
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "produtos_representacaoId_idx" ON "produtos"("representacaoId");

-- CreateTable cliente_representacoes
CREATE TABLE "cliente_representacoes" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "representacaoId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "responsavel" TEXT,
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cliente_representacoes_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "cliente_representacoes_clienteId_representacaoId_key" ON "cliente_representacoes"("clienteId","representacaoId");
CREATE INDEX "cliente_representacoes_clienteId_idx" ON "cliente_representacoes"("clienteId");
CREATE INDEX "cliente_representacoes_representacaoId_idx" ON "cliente_representacoes"("representacaoId");

-- Add FK
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_representacaoId_fkey" FOREIGN KEY ("representacaoId") REFERENCES "representacoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cliente_representacoes" ADD CONSTRAINT "cliente_representacoes_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cliente_representacoes" ADD CONSTRAINT "cliente_representacoes_representacaoId_fkey" FOREIGN KEY ("representacaoId") REFERENCES "representacoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cliente_passos" ADD COLUMN "representacaoId" TEXT;
ALTER TABLE "cliente_passos" ADD CONSTRAINT "cliente_passos_representacaoId_fkey" FOREIGN KEY ("representacaoId") REFERENCES "representacoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "cliente_passos_representacaoId_idx" ON "cliente_passos"("representacaoId");

-- Seed representacoes iniciais
INSERT INTO "representacoes" ("id","nome","slug","descricao","segmento","status","criadoEm","atualizadoEm") VALUES
('rep-engezer','ENGEZER','engezer','Equipamentos industriais e caldeiras','Instrumentação','ativa',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('rep-pesco','PESCO','pesco','Bombas, compressores e filtragem','Automação & Controle','ativa',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
