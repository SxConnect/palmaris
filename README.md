# Palmaris Representações — Site Institucional + CMS

Site institucional e CMS da **Palmaris Representações** (Conectamos indústria, tecnologia e soluções).

- **Site público:** Soluções, Mercados, Parceiros, Projetos e Contato conforme layout do mockup.
- **Painel do CMS:** `/admin` — gerenciamento dinâmico de páginas, blocos modulares, notícias, mídias, menus e mensagens.
- **Banco:** PostgreSQL via Prisma 7.
- **Stack:** Next.js 16 (App Router) + Prisma 7 + PostgreSQL + Tailwind CSS 4 + Docker.

---

## Estrutura de Blocos da Página Inicial (Mockup Palmaris)

1. **Hero (`hero`):** "Conectamos indústria, tecnologia e soluções.", botões de CTA duplo e imagem do operador.
2. **Nossas Soluções (`solutions`):** Grid de 8 cards com ícones azuis, rotas e descrições técnicas.
3. **Sobre a Palmaris (`about`):** Apresentação institucional, 4 diferenciais em badges e foto de refinaria.
4. **Mercados de Atuação (`markets`):** 5 segmentos industriais (Petroquímico, Alimentício, Papel e Celulose, Energia e Saneamento, Metalúrgico).
5. **Parceiros (`partners`):** Destaque para marcas representadas (PESCO, EMGEZER).
6. **Por que escolher a Palmaris (`why_us`):** Card em destaque e 4 pilares de valor.
7. **Chamada Final (`cta`):** "VAMOS CONVERSAR? Sua operação mais eficiente começa com o parceiro certo."
8. **Rodapé:** Logotipo integrado, dados de contato ((21) 99876-5432, contato@palmarisrepresentacoes.com.br), links e redes sociais (LinkedIn, Instagram).

---

## 1. O que dá para fazer pelo painel

| Área | O que faz |
| --- | --- |
| **Páginas** (`/admin/paginas`) | A página inicial é formada por **blocos**: Capa, Quem somos, Nossos projetos, Últimas notícias, Galeria de fotos, Chamada para ação e Texto livre (HTML). Cada bloco tem editor próprio (títulos, textos, imagens, botões) e pode ser reordenado. |
| **Notícias** (`/admin/noticias`) | Artigos com resumo, categoria, imagem de capa e galeria. Publicados, aparecem em `/noticias` e automaticamente no bloco “Últimas notícias” da home. |
| **Galerias de fotos** (`/admin/galerias`) | Cria galerias, escolhe as fotos da biblioteca de mídia, escreve legendas e gera o **shortcode** para inserir em qualquer texto. |
| **Mídia** (`/admin/midias`) | Biblioteca de imagens (envio, exclusão e cópia do endereço). |
| **Menu** (`/admin/menu`) | Itens do cabeçalho, ordem, item em pílula vermelha (botão “Filiados”), submenus. |
| **Usuários** (`/admin/usuarios`) | Cadastro de quem gerencia o site, bloqueio de acessos e exclusão de contas. |
| **Mensagens** (`/admin/mensagens`) | Caixa de entrada das mensagens enviadas pelo formulário de contato do site. |
| **Configurações** (`/admin/configuracoes`) | Logotipo, endereço, CNPJ, e-mail, telefone, **redes sociais** e texto do rodapé. |

### Ícones das redes sociais

Os ícones do **Facebook** e do **Instagram** ficam sempre visíveis **no topo, ao lado do
logotipo**, e também no rodapé. O endereço de cada um é cadastrado em
**Configurações → redes sociais**:

| Campo | Onde aparece |
| --- | --- |
| **Facebook (endereço do perfil)** | Ícone do Facebook no topo (ao lado do logo) e no rodapé |
| **Instagram (endereço do perfil)** | Ícone do Instagram no topo (ao lado do logo) e no rodapé |

Pode digitar com ou sem `https://` — o site completa sozinho (`facebook.com/almzo` vira
`https://facebook.com/almzo`). Enquanto o endereço não for preenchido, o ícone aparece
apagado e avisa que falta configurar o link.

### Formulário de contato

A página **Contato** tem um formulário que envia a mensagem para o e-mail da associação
(`almzopelalutamoradia2025@gmail.com`, configurável em **Configurações → E-mail**).

- a mensagem é **sempre gravada no banco** e aparece em **Admin → Mensagens** (com opção de
  marcar como respondida ou excluir);
- o envio por **e-mail** só acontece se o SMTP estiver configurado — sem SMTP, a mensagem
  continua registrada no painel (nada se perde);
- proteção contra robôs: campo isca (honeypot) e limite de 3 mensagens por IP a cada
  10 minutos.

Para ativar o envio por e-mail, defina no `.env` (da VPS):

```
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="almzopelalutamoradia2025@gmail.com"
SMTP_PASS="senha_de_app_do_gmail"
SMTP_FROM="ALMZO <almzopelutamoradia2025@gmail.com>"
```

O bloco é editável em **Páginas → Contato → Editar blocos**: dá para mudar o título, o texto
de apresentação e o e-mail destinatário — ou adicionar o mesmo bloco em outra página.

### Usuários e permissões

A conta definida em `ADMIN_EMAIL` (padrão no `.env`) é a **conta principal — dono do site**.

| Ação | Administrador comum | Dono do site |
| --- | :---: | :---: |
| Criar novos usuários | ✅ | ✅ |
| Editar nome/e-mail/senha de usuários comuns | ✅ | ✅ |
| Alterar nível de acesso (administrador/usuário) | ❌ | ✅ |
| Bloquear ou reabilitar um acesso | ❌ | ✅ |
| Excluir um usuário | ❌ | ✅ |
| Alterar/excluir/bloquear a **conta principal** | ❌ | ❌ (nunca) |

Contas **bloqueadas** não conseguem entrar no painel, não recebem e-mail de recuperação de senha
e não conseguem se cadastrar novamente com o mesmo e-mail (nem o próprio dono consegue
recadastrar um e-mail bloqueado — é preciso reabilitar antes).

### Vídeo do YouTube

Basta colar o link do vídeo no texto da notícia, da página ou de um bloco — ele vira
vídeo embutido automaticamente na página publicada. Formatos aceitos:

- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/shorts/VIDEO_ID`

Ou use o botão **"YouTube"** do editor para inserir o shortcode:

```text
[youtube url="https://www.youtube.com/watch?v=VIDEO_ID"]
```

### Galeria de fotos: como inserir

1. Envie as fotos em **Mídia**.
2. Crie uma galeria em **Galerias de fotos** e adicione as imagens (com legendas).
3. Copie o shortcode exibido na galeria:

```text
[galeria slug="assembleia-de-moradores"]
```

4. Cole o shortcode no texto da notícia, da página ou de um bloco — **ou** use o botão
   **“Galeria”** do editor, que insere o código pronto.

Opções do shortcode: `columns` (1 a 6) e `caption` (legenda abaixo das fotos):

```text
[galeria slug="assembleia-de-moradores" columns="4" caption="Reunião de junho"]
```

O bloco **“Galeria de fotos”** da home também usa o *slug* da galeria.

---

## 2. Rodando localmente (sem Docker)

```bash
cp .env.example .env        # ajuste o DATABASE_URL
npm install
npm run db:deploy           # cria as tabelas
npm run db:seed             # conteúdo inicial (idempotente)
npm run dev                 # http://localhost:3000  ·  painel em /admin
```

O banco pode ser um PostgreSQL local:

```bash
docker run -d --name almzo-db \
  -e POSTGRES_USER=almzo -e POSTGRES_PASSWORD=almzo -e POSTGRES_DB=almzo \
  -p 5432:5432 postgres:16-alpine
```

Credenciais do painel (definidas em `ADMIN_EMAIL` / `ADMIN_PASSWORD` no `.env`):
padrão `almzo@almzo.com.br` / `Almzo@2025` — **troque antes de publicar**.

---

## 3. Publicação com Docker (VPS)

O `docker-compose.yml` sobe **o site + o painel + o PostgreSQL** (com volume persistente).

```bash
cp .env.example .env        # troque POSTGRES_PASSWORD, ADMIN_PASSWORD e APP_URL
docker compose up -d --build
docker compose logs -f app  # acompanha o start (migrações + seed)
```

O site responde em `http://IP-DA-VPS:3000` (ajuste `APP_PORT`).

### O que acontece ao iniciar o container

1. espera o PostgreSQL ficar pronto;
2. `prisma migrate deploy` (aplica as migrações);
3. `prisma/seed.ts` — cria o conteúdo inicial **apenas se ainda não existir**
   (nunca sobrescreve o que foi publicado no painel);
4. sobe o Next.js em `:3000`.

### Atualizar o site depois de novas alterações

```bash
git pull
docker compose up -d --build
```

### apontar o domínio almzo.com.br

Use um proxy reverso (Nginx/Caddy) na VPS:

```nginx
server {
    server_name almzo.com.br www.almzo.com.br;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

E defina `APP_URL=https://almzo.com.br` no `.env` (usado em SEO e links).

### Imagem única, sem Compose

```bash
docker build -t almzo-site:latest .
docker run -d --name almzo -p 3000:3000 \
  -e DATABASE_URL="postgresql://usuario:senha@host:5432/almzo" \
  -e APP_URL="https://almzo.com.br" \
  -e ADMIN_EMAIL="..." -e ADMIN_PASSWORD="..." \
  almzo-site:latest
```

---

## 4. Estrutura do projeto

```
prisma/
  schema.prisma        # User, Page, Section (blocos), MenuItem, Post, Media, Gallery…
  migrations/          # migrações do banco
  seed.ts              # conteúdo inicial (idempotente)
src/
  app/
    (public)/          # site: home, /noticias, /p/[slug]
    admin/             # painel do CMS
    api/               # /api/health, /api/media, /api/galleries, /api/menu
  components/
    blocks/            # blocos da home (hero, about, projects, news, gallery, cta)
    site/              # cabeçalho, rodapé, galeria com lightbox
    admin/             # seletores de mídia e shortcodes
  lib/
    blocks.ts          # tipos dos blocos
    galleries.ts       # shortcode [galeria]
    site-settings.ts   # configurações do site
    actions/           # server actions (páginas, blocos, notícias, galerias…)
public/img/             # logotipo, capa e imagens dos projetos
Dockerfile              # build de produção (Next.js standalone)
docker/entrypoint.sh    # migrações + seed + start
```

### Como a home é montada

A página de *slug* `home` tem uma lista de **seções** (`Section`), cada uma com um
`kind`:

| kind | Bloco |
| --- | --- |
| `hero` | Capa com imagem de fundo, título, subtítulo e botão |
| `about` | Quem somos (texto + pilares) |
| `projects` | Nossos projetos (cards) |
| `news` | Últimas notícias (automático) |
| `gallery` | Galeria de fotos |
| `cta` | Chamada para ação |
| `html` | Texto livre (aceita o shortcode de galeria) |

---

## 5. Backup

O banco é a única parte que precisa de backup (as imagens ficam nele):

```bash
docker compose exec db pg_dump -U almzo almzo > backup_$(date +%F).sql
```

---

## 6. Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Sobe o build de produção |
| `npm run db:deploy` | Aplica as migrações |
| `npm run db:seed` | Carrega o conteúdo inicial (não sobrescreve edições) |
| `npm run db:studio` | Prisma Studio (interface visual do banco) |
| `npm run typecheck` | Verificação de tipos |
