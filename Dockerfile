# syntax=docker/dockerfile:1

# ============================================================
# ALMZO — imagem de produção (site + painel CMS)
#
# Imagem única e auto-migrante: na VPS basta um `docker compose up -d`
# (sem construir nada localmente). O container aplica as migrações,
# carrega o conteúdo inicial (idempotente) e sobe o site.
# ============================================================

# ---------- 1. Dependências ----------
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci

# ---------- 2. Build ----------
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate && npm run build

# ---------- 3. Execução (site + painel + migrações) ----------
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat openssl postgresql-client
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Standalone do Next.js (server.js + .next + node_modules traçado)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# node_modules completo do deps (inclui prisma CLI, tsx e dependências transitivas)
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
# Remove pacotes de desenvolvimento para reduzir o tamanho da imagem
RUN rm -rf node_modules/typescript node_modules/@types node_modules/eslint \
    node_modules/eslint-config-next node_modules/@eslint node_modules/tailwindcss \
    node_modules/@tailwindcss node_modules/.cache node_modules/.bin/next \
    node_modules/.bin/tsc node_modules/.bin/eslint node_modules/nodemailer
# Assets estáticos
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
# Schema, migrações e cliente gerado do Prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/src/generated ./src/generated
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts

COPY --chmod=755 docker/entrypoint.sh /usr/local/bin/entrypoint.sh

USER nextjs
EXPOSE 3000
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
