ALTER TABLE "clientes" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'ativo';
ALTER TABLE "clientes" ADD COLUMN "motivoInativo" TEXT;
ALTER TABLE "contatos_representacao" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'ativo';
ALTER TABLE "contatos_representacao" ADD COLUMN "motivoInativo" TEXT;
