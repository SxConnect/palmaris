/**
 * Seed da Palmaris Representações — cria o conteúdo inicial do site e CMS.
 *
 * Idempotente e não destrutivo: cria apenas os registros que ainda não existem.
 */
import { config } from "dotenv";
import fs from "node:fs";
import path from "node:path";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

config({ path: ".env" });
config({ path: ".env.local", override: true });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL não definida");
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

/* ------------------------------------------------------------------ */
/* Textos institucionais das páginas                                   */
/* ------------------------------------------------------------------ */

const TEXTO_SOLUCOES = `
<h2>Engenharia, Automação e Representação de Alta Tecnologia</h2>
<p>
  A <strong>Palmaris Representações</strong> é especializada na integração de tecnologias industriais
  avançadas, conectando indústrias de processo e manufatura aos principais fabricantes mundiais de
  instrumentação, automação e controle operacional.
</p>
<h3>Nossas Linhas de Soluções</h3>
<ul>
  <li><strong>Automação e Controle:</strong> Sistemas de controle distribuído (DCS), CLPs, IHMs e arquiteturas industriais redundantes.</li>
  <li><strong>Painéis Elétricos:</strong> Projetos normatizados (NR-10, IEC), montagem, testes de aceitação em fábrica (TAF) e comissionamento de painéis de força e controle.</li>
  <li><strong>Telemetria e Supervisão:</strong> Monitoramento remoto, SCADA em nuvem e telemetria de estações remotas em tempo real.</li>
  <li><strong>Monitoramento Ambiental (CEMS e ETEs):</strong> Sistemas contínuos de medição de emissões atmosféricas, estações de tratamento de efluentes e conformidade com órgãos ambientais (INEA, CETESB, IBAMA).</li>
  <li><strong>Eficiência em Combustão:</strong> Otimização de queima em caldeiras e fornos industriais, reduzindo consumo de combustível fóssil e emissões de CO/NOx.</li>
  <li><strong>Detecção de Gases e Alarmes de Segurança:</strong> Detectores tóxicos e inflamáveis com certificação SIL para ambientes com atmosfera explosiva (Ex).</li>
  <li><strong>Manutenção Preditiva e Confiabilidade:</strong> Análise de vibração, termografia e monitoramento de ativos críticos para eliminação de paradas não programadas.</li>
  <li><strong>Instrumentação Analítica de Processo:</strong> Medição de gases, umidade, concentração, viscosidade e particulados com máxima precisão.</li>
</ul>
`;

const TEXTO_MERCADOS = `
<h2>Segmentos Industriais Atendidos</h2>
<p>
  Compreendemos as particularidades normativas, operacionais e de segurança de cada segmento da indústria nacional.
</p>
<h3>Atuação Setorial</h3>
<ul>
  <li><strong>Petroquímico e Químico:</strong> Ambientes severos, áreas classificadas, instrumentação intrinsecamente segura e controle de queima e emissões.</li>
  <li><strong>Alimentício e Bebidas:</strong> Normas sanitárias rigorosas, instrumentação higiênica em aço inoxidável e rastreabilidade total de processos.</li>
  <li><strong>Papel e Celulose:</strong> Monitoramento contínuo em ambientes corrosivos, controle de umidade e viscosidade de polpa, e gestão hídrica.</li>
  <li><strong>Energia e Saneamento:</strong> Estações de tratamento de água (ETA), estações de esgoto (ETE), usinas termelétricas e hidrelétricas.</li>
  <li><strong>Metalúrgico e Manufatura:</strong> Robótica industrial, linhas de estampagem, fornos de tratamento térmico e automação de alta cadência.</li>
</ul>
`;

const TEXTO_PARCEIROS = `
<h2>Parcerias Estratégicas Globais</h2>
<p>
  Trabalhamos em conjunto com marcas líderes globais para garantir que nossos clientes tenham acesso à tecnologia mais confiável e duradoura do mercado.
</p>
<h3>Nossos Parceiros Oficiais</h3>
<ul>
  <li><strong>PESCO Automação & Controle:</strong> Soluções completas em integração de sistemas, instrumentação de campo e painéis de automação industrial.</li>
  <li><strong>ENGEZER:</strong> Excelência em analisadores de gases, monitoramento ambiental e tecnologias industriais de alta precisão.</li>
</ul>
<p>
  Todas as soluções contam com suporte técnico local, garantia de fábrica e assistência de engenharia dedicada.
</p>
`;

const TEXTO_PROJETOS = `
<h2>Cases e Projetos Industriais</h2>
<p>
  Ao longo de anos de atuação no mercado fluminense e nacional, a Palmaris Representações implementou projetos de alta complexidade em clientes de grande porte.
</p>
<h3>Destaques de Aplicação</h3>
<ul>
  <li>Modernização de sistema de supervisão e telemetria em terminal de tancagem.</li>
  <li>Implantação de sistema CEMS de monitoramento contínuo de emissões em refinaria.</li>
  <li>Automação de malha de controle de combustão em caldeiras industriais com redução de 12% no consumo energético.</li>
  <li>Adequação completa de detectores de gás e chama em conformidade com normas NR-20 e NR-13.</li>
</ul>
`;

/* ------------------------------------------------------------------ */
/* Seed Principal                                                     */
/* ------------------------------------------------------------------ */

async function main() {
  const email = (process.env.ADMIN_EMAIL || "contato@palmarisrepresentacoes.com.br").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "Palmaris@2026";
  const name = process.env.ADMIN_NAME || "Diretoria Palmaris";

  /* 1. Usuário administrador --------------------------------------- */
  const passwordHash = await bcrypt.hash(password, 10);
  const wantsReset = /^(1|true|yes)$/i.test(process.env.ADMIN_RESET || "");
  const existingAdmin = await prisma.user.findUnique({ where: { email } });

  if (!existingAdmin) {
    await prisma.user.create({
      data: { email, name, passwordHash, role: "ADMIN", owner: true },
    });
    console.log(`Admin criado: ${email}`);
  } else if (wantsReset) {
    await prisma.user.update({
      where: { email },
      data: { passwordHash },
    });
    console.log(`Senha do admin redefinida via ADMIN_RESET: ${email}`);
  }

  /* 2. Configurações gerais da Palmaris ---------------------------- */
  const settings = {
    siteName: "Palmaris Representações",
    tagline: "Conectamos indústria, tecnologia e soluções.",
    logoUrl: "/img/logo-palmaris.jpg",
    address: "Av. Industrial, 1000 - Rio de Janeiro - RJ, CEP 22775-000",
    cnpj: "",
    email: "contato@palmarisrepresentacoes.com.br",
    phone: "(21) 99876-5432",
    facebookUrl: "",
    instagramUrl: "https://instagram.com/palmarisrepresentacoes",
    linkedinUrl: "https://linkedin.com/company/palmarisrepresentacoes",
    footerNote: "Representação comercial e integração de soluções industriais de alta performance.",
  };

  await prisma.setting.upsert({
    where: { key: "site" },
    update: { value: settings },
    create: { key: "site", value: settings },
  });
  console.log("Configurações da Palmaris atualizadas.");

  /* 3. Páginas institucionais -------------------------------------- */
  const pages = [
    {
      title: "Soluções",
      slug: "solucoes",
      content: TEXTO_SOLUCOES,
      menuOrder: 1,
    },
    {
      title: "Mercados",
      slug: "mercados",
      content: TEXTO_MERCADOS,
      menuOrder: 2,
    },
    {
      title: "Parceiros",
      slug: "parceiros",
      content: TEXTO_PARCEIROS,
      menuOrder: 3,
    },
    {
      title: "Projetos",
      slug: "projetos",
      content: TEXTO_PROJETOS,
      menuOrder: 4,
    },
    {
      title: "Contato",
      slug: "contato",
      content: "<p>Entre em contato com nossos consultores técnicos e receba atendimento sob medida para a sua indústria.</p>",
      menuOrder: 5,
    },
  ];

  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {
        title: page.title,
        content: page.content,
        published: true,
        showInMenu: true,
        menuOrder: page.menuOrder,
      },
      create: {
        title: page.title,
        slug: page.slug,
        content: page.content,
        published: true,
        showInMenu: true,
        menuOrder: page.menuOrder,
      },
    });
    console.log(`Página configurada: ${page.title}`);
  }

  /* 4. Página inicial e seus blocos (Layout idêntico ao Mockup) --- */
  const home = await prisma.page.upsert({
    where: { slug: "home" },
    update: { title: "Página Inicial", published: true },
    create: {
      title: "Página Inicial",
      slug: "home",
      content: "",
      published: true,
      showInMenu: false,
      menuOrder: 0,
    },
  });

  // Removemos blocos antigos da home para garantir ordenação e dados fieis ao mockup
  await prisma.section.deleteMany({ where: { pageId: home.id } });

  await prisma.section.createMany({
    data: [
      {
        pageId: home.id,
        title: "Capa Principal",
        kind: "hero",
        sectionOrder: 0,
        visible: true,
        data: {
          eyebrow: "PALMARIS REPRESENTAÇÕES",
          title: "Conectamos indústria,",
          highlightText: "tecnologia e soluções.",
          subtitle:
            "Integração de soluções industriais, automação e parceiros especializados para desafios reais de operação.",
          ctaLabel: "Fale com um especialista",
          ctaUrl: "/p/contato",
          secondaryCtaLabel: "Conheça nossas soluções",
          secondaryCtaUrl: "#solucoes",
          imageUrl: "/img/hero-operator.jpg",
          imageAlt: "Operador técnico em controle industrial com tablet",
        },
      },
      {
        pageId: home.id,
        title: "Nossas Soluções",
        kind: "solutions",
        sectionOrder: 1,
        visible: true,
        data: {
          title: "Nossas",
          highlightText: "soluções",
          subtitle:
            "Tecnologia e expertise para aumentar a eficiência, segurança e sustentabilidade da sua operação.",
          items: [
            {
              title: "Automação e controle",
              description: "Sistemas inteligentes para operação mais eficiente e segura.",
              icon: "gear",
            },
            {
              title: "Painéis elétricos",
              description: "Projetos, montagens e soluções completas em painéis elétricos.",
              icon: "bolt",
            },
            {
              title: "Telemetria e supervisão",
              description: "Monitoramento remoto e gestão em tempo real dos seus processos.",
              icon: "chart",
            },
            {
              title: "Monitoramento do meio ambiente (emissões e ETEs)",
              description: "Conformidade ambiental e controle de emissões e efluentes.",
              icon: "water",
            },
            {
              title: "Soluções e eficiência em combustão",
              description: "Mais desempenho, menor consumo e maior eficiência energética.",
              icon: "flame",
            },
            {
              title: "Segurança — detectores de gases e alarmes",
              description: "Proteção para pessoas, instalações e processos.",
              icon: "shield",
            },
            {
              title: "Soluções para manutenção nas fábricas",
              description: "Tecnologia e ferramentas para reduzir paradas e aumentar a confiabilidade.",
              icon: "wrench",
            },
            {
              title: "Processo — monitoramento de gases, umidade, líquidos, viscosidade e particulado",
              description: "Dados precisos para decisões mais assertivas.",
              icon: "flask",
            },
          ],
        },
      },
      {
        pageId: home.id,
        title: "Sobre a Palmaris",
        kind: "about",
        sectionOrder: 2,
        visible: true,
        data: {
          eyebrow: "SOBRE A PALMARIS",
          title: "Mais que representação,",
          highlightText: "somos integração de soluções.",
          text: "A Palmaris Representações atua conectando empresas a soluções industriais de alta performance, com foco em automação, controle, monitoramento e eficiência operacional.",
          imageUrl: "/img/about-refinery.jpg",
          imageAlt: "Refinaria e planta industrial iluminada",
          features: [
            { title: "Experiência no setor industrial", icon: "user" },
            { title: "Parceiros estratégicos", icon: "handshake" },
            { title: "Soluções personalizadas", icon: "shield" },
            { title: "Compromisso com resultados", icon: "target" },
          ],
        },
      },
      {
        pageId: home.id,
        title: "Mercados de Atuação",
        kind: "markets",
        sectionOrder: 3,
        visible: true,
        data: {
          title: "Mercados de atuação",
          subtitle: "Atendemos diversos segmentos industriais, com soluções sob medida para cada realidade.",
          ctaLabel: "Ver todos os mercados",
          ctaUrl: "/p/mercados",
          items: [
            { title: "Petroquímico e Químico", imageUrl: "/img/market-petroquimico.jpg" },
            { title: "Alimentício e Bebidas", imageUrl: "/img/market-alimenticio.jpg" },
            { title: "Papel e Celulose", imageUrl: "/img/market-papel.jpg" },
            { title: "Energia e Saneamento", imageUrl: "/img/market-energia.jpg" },
            { title: "Metalúrgico e Manufatura", imageUrl: "/img/market-metalurgico.jpg" },
          ],
        },
      },
      {
        pageId: home.id,
        title: "Parceiros Oficiais",
        kind: "partners",
        sectionOrder: 4,
        visible: true,
        data: {
          title: "Parceiros que ampliam possibilidades",
          subtitle: "Trabalhamos com as melhores marcas do mercado para entregar soluções completas e confiáveis.",
          items: [
            { name: "PESCO", category: "Automação & Controle", logoUrl: "/img/logo-pesco.png" },
            { name: "ENGEZER", category: "Equipamentos Industriais", logoUrl: "/img/logo-engezer.png" },
          ],
        },
      },
      {
        pageId: home.id,
        title: "Por que escolher a Palmaris",
        kind: "why_us",
        sectionOrder: 5,
        visible: true,
        data: {
          cardTitle: "Por que escolher a Palmaris?",
          cardDescription:
            "Aliamos tecnologia, experiência e parcerias estratégicas para entregar soluções que geram eficiência, segurança e resultados reais para o seu negócio.",
          imageUrl: "/img/why-us-operator.jpg",
          benefits: [
            {
              title: "Soluções completas em um único parceiro",
              description: "Da automação ao monitoramento ambiental.",
              icon: "cogs",
            },
            {
              title: "Suporte técnico especializado",
              description: "Equipe preparada para atender com agilidade e precisão.",
              icon: "shield-check",
            },
            {
              title: "Foco em resultados",
              description: "Mais eficiência, segurança e sustentabilidade para a sua operação.",
              icon: "target",
            },
            {
              title: "Atendimento próximo e consultivo",
              description: "Entendemos o seu desafio e entregamos a melhor solução.",
              icon: "users",
            },
          ],
        },
      },
      {
        pageId: home.id,
        title: "Chamada de Ação Final",
        kind: "cta",
        sectionOrder: 6,
        visible: true,
        data: {
          eyebrow: "VAMOS CONVERSAR?",
          title: "Sua operação mais eficiente começa com o parceiro certo.",
          text: "Fale com nossa equipe e descubra como a Palmaris pode ajudar o seu negócio.",
          buttonLabel: "Fale com um especialista",
          buttonUrl: "/p/contato",
        },
      },
    ],
  });
  console.log("Blocos da página inicial configurados com sucesso.");

  /* 5. Bloco de contato na página /contato -------------------------- */
  const contactPage = await prisma.page.findUnique({ where: { slug: "contato" } });
  if (contactPage) {
    await prisma.section.deleteMany({ where: { pageId: contactPage.id } });
    await prisma.section.create({
      data: {
        pageId: contactPage.id,
        title: "Formulário de Contato",
        kind: "contact",
        sectionOrder: 0,
        visible: true,
        data: {
          title: "FALE COM UM ESPECIALISTA",
          subtitle: "Preencha seus dados para receber nosso contato consultivo.",
          intro: "Nossa equipe de engenheiros e consultores técnicos está à disposição para analisar suas necessidades operacionais.",
          recipient: "contato@palmarisrepresentacoes.com.br",
        },
      },
    });
    console.log("Formulário de contato inserido na página Contato.");
  }

  /* 6. Itens de Menu ---------------------------------------------- */
  await prisma.menuItem.deleteMany({});
  const menu = [
    { label: "Soluções", url: "/p/solucoes", menuOrder: 0, highlight: false },
    { label: "Mercados", url: "/p/mercados", menuOrder: 1, highlight: false },
    { label: "Parceiros", url: "/p/parceiros", menuOrder: 2, highlight: false },
    { label: "Projetos", url: "/p/projetos", menuOrder: 3, highlight: false },
    { label: "Contato", url: "/p/contato", menuOrder: 4, highlight: false },
    { label: "Fale com um especialista", url: "/p/contato", menuOrder: 5, highlight: true },
  ];

  for (const item of menu) {
    await prisma.menuItem.create({ data: { ...item, visible: true, target: "_self" } });
  }
  console.log("Menu principal da Palmaris configurado.");

  /* 7. Fotos iniciais cadastradas no banco de mídias ------------- */
  const initialMediaFiles = [
    { file: "public/img/logo-palmaris.jpg", alt: "Logotipo Palmaris Representações" },
    { file: "public/img/hero-operator.jpg", alt: "Operador técnico Palmaris" },
    { file: "public/img/about-refinery.jpg", alt: "Refinaria e planta industrial" },
    { file: "public/img/why-us-operator.jpg", alt: "Especialista técnico industrial" },
    { file: "public/img/market-petroquimico.jpg", alt: "Setor Petroquímico e Químico" },
    { file: "public/img/market-alimenticio.jpg", alt: "Setor Alimentício e Bebidas" },
    { file: "public/img/market-papel.jpg", alt: "Setor de Papel e Celulose" },
    { file: "public/img/market-energia.jpg", alt: "Setor de Energia e Saneamento" },
    { file: "public/img/market-metalurgico.jpg", alt: "Setor Metalúrgico e Manufatura" },
  ];

  for (const item of initialMediaFiles) {
    const absolute = path.join(process.cwd(), item.file);
    if (!fs.existsSync(absolute)) continue;

    const filename = path.basename(item.file);
    const existing = await prisma.media.findFirst({ where: { filename } });
    if (existing) continue;

    const data = fs.readFileSync(absolute);
    await prisma.media.create({
      data: {
        filename,
        mimeType: filename.endsWith(".png") ? "image/png" : "image/jpeg",
        data,
        size: data.length,
        altText: item.alt,
      },
    });
  }

  console.log("Seed da Palmaris concluído com sucesso!");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
