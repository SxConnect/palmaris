# 🚀 Deploy no Portainer — Palmaris Representações

## 🐳 Imagem Docker (GHCR)
```
ghcr.io/sxconnect/palmaris:latest
```

A imagem é **auto-migrante e auto-inicializável**: ao subir na VPS, aplica as migrações no PostgreSQL, carrega o conteúdo inicial completo (layout idêntico ao mockup, páginas, blocos e parceiros) e inicia o servidor Next.js.

---

## 📦 Stack do Portainer (`portainer-stack.yml`)

No Portainer:
1. Vá em **Stacks** → **Add stack**.
2. Nome da stack: `palmaris`.
3. Cole o YAML abaixo:

```yaml
version: '3.8'

services:
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-palmaris}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-troque-esta-senha}
      POSTGRES_DB: ${POSTGRES_DB:-palmaris}
    volumes:
      - palmaris-db:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-palmaris} -d ${POSTGRES_DB:-palmaris}"]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 10s

  app:
    image: ghcr.io/sxconnect/palmaris:latest
    container_name: palmaris
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "127.0.0.1:${APP_PORT:-3000}:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://${POSTGRES_USER:-palmaris}:${POSTGRES_PASSWORD:-troque-esta-senha}@db:5432/${POSTGRES_DB:-palmaris}?schema=public
      - APP_URL=${APP_URL:-https://palmarisrepresentacoes.com.br}
      - ADMIN_EMAIL=${ADMIN_EMAIL:-contato@palmarisrepresentacoes.com.br}
      - ADMIN_PASSWORD=${ADMIN_PASSWORD:-Palmaris@2026}
      - ADMIN_NAME=${ADMIN_NAME:-Palmaris Representações}
      - ADMIN_RESET=${ADMIN_RESET:-false}
      - DB_HOST=db
      - DB_PORT=5432
      - DB_USER=${POSTGRES_USER:-palmaris}
    healthcheck:
      test: ["CMD-SHELL", "wget -q -O - http://127.0.0.1:3000/api/health || exit 1"]
      interval: 30s
      timeout: 5s
      retries: 5
      start_period: 40s
    networks:
      - default
      - proxy
    labels:
      - "traefik.enable=true"
      - "traefik.docker.network=${TRAEFIK_NETWORK:-portainer_default}"
      - "traefik.http.routers.palmaris.rule=Host(`${TRAEFIK_DOMAIN:-palmarisrepresentacoes.com.br}`) || Host(`www.${TRAEFIK_DOMAIN:-palmarisrepresentacoes.com.br}`)"
      - "traefik.http.routers.palmaris.entrypoints=websecure"
      - "traefik.http.services.palmaris.loadbalancer.server.port=3000"
      - "traefik.http.routers.palmaris.tls.certresolver=leresolver"

volumes:
  palmaris-db:
    driver: local

networks:
  proxy:
    external: true
    name: ${TRAEFIK_NETWORK:-portainer_default}
```

---

## ⚙️ Variáveis de Ambiente no Portainer

| Variável | Descrição / Exemplo |
|---|---|
| `POSTGRES_USER` | `palmaris` |
| `POSTGRES_PASSWORD` | Uma senha segura para o banco |
| `POSTGRES_DB` | `palmaris` |
| `APP_PORT` | `3000` (ou porta interna livre na VPS) |
| `APP_URL` | `https://palmarisrepresentacoes.com.br` |
| `ADMIN_EMAIL` | `contato@palmarisrepresentacoes.com.br` |
| `ADMIN_PASSWORD` | Senha inicial de acesso ao `/admin` |
| `ADMIN_NAME` | `Palmaris Representações` |
| `ADMIN_RESET` | `false` (mude para `true` apenas se precisar redefinir a senha do admin) |
| `TRAEFIK_NETWORK` | `portainer_default` (rede do Traefik na VPS) |
| `TRAEFIK_DOMAIN` | `palmarisrepresentacoes.com.br` (domínio apontado para a VPS) |
