#!/bin/sh
# Entrypoint do container do site Palmaris Representações (imagem auto-migrante).
#
# 1. espera o PostgreSQL ficar disponível;
# 2. aplica as migrações do Prisma;
# 3. carrega o conteúdo inicial (seed idempotente — não sobrescreve edições);
# 4. sobe o site (frontend + painel /admin).
set -e

DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-palmaris}"

echo "==> Aguardando o PostgreSQL (${DB_HOST}:${DB_PORT})..."
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" >/dev/null 2>&1; do
  sleep 2
done
echo "==> Banco disponível."

echo "==> Aplicando migrações do banco..."
node ./node_modules/prisma/build/index.js migrate deploy

echo "==> Carregando o conteúdo inicial (idempotente)..."
node --import tsx prisma/seed.ts

echo "==> Palmaris Representações no ar em http://0.0.0.0:${PORT:-3000} (painel em /admin)"
exec node server.js
