// Configuração do Prisma 7 (CLI). Carrega as variáveis de ambiente
// de `.env` e de `.env.local` (o `.env.local` tem prioridade).
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: ".env" });
config({ path: ".env.local", override: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
