/**
 * Tipos e utilitários dos blocos de conteúdo do site da Palmaris Representações.
 *
 * Cada bloco (tabela `sections`) tem um `kind` que define como ele é
 * renderizado e um `data` (JSON) com os campos editáveis pelo painel.
 */

export const BLOCK_KINDS = [
  "html",
  "hero",
  "solutions",
  "about",
  "markets",
  "partners",
  "why_us",
  "projects",
  "news",
  "gallery",
  "contact",
  "cta",
] as const;

export type BlockKind = (typeof BLOCK_KINDS)[number];

export const BLOCK_KIND_LABELS: Record<BlockKind, string> = {
  html: "Texto livre (HTML)",
  hero: "Capa (hero)",
  solutions: "Nossas soluções",
  about: "Sobre a Palmaris",
  markets: "Mercados de atuação",
  partners: "Parceiros",
  why_us: "Por que escolher a Palmaris",
  projects: "Projetos e cases",
  news: "Notícias e artigos",
  gallery: "Galeria de fotos",
  contact: "Formulário de contato",
  cta: "Chamada para ação",
};

export type HeroData = {
  eyebrow: string;
  title: string;
  highlightText: string;
  subtitle: string;
  ctaLabel: string;
  ctaUrl: string;
  secondaryCtaLabel: string;
  secondaryCtaUrl: string;
  imageUrl: string;
  imageAlt: string;
};

export type SolutionItem = {
  title: string;
  description: string;
  icon: string;
  url?: string;
};

export type SolutionsData = {
  title: string;
  highlightText: string;
  subtitle: string;
  items: SolutionItem[];
};

export type AboutFeature = {
  title: string;
  icon: string;
};

export type AboutData = {
  eyebrow: string;
  title: string;
  highlightText: string;
  subtitle: string;
  text: string;
  imageUrl: string;
  imageAlt: string;
  features: AboutFeature[];
  pillars: string[];
};

export type MarketItem = {
  title: string;
  imageUrl: string;
  icon?: string;
};

export type MarketsData = {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaUrl: string;
  items: MarketItem[];
};

export type PartnerItem = {
  name: string;
  category: string;
  logoUrl?: string;
};

export type PartnersData = {
  title: string;
  subtitle: string;
  items: PartnerItem[];
};

export type WhyUsBenefit = {
  title: string;
  description: string;
  icon?: string;
};

export type WhyUsData = {
  cardTitle: string;
  cardDescription: string;
  imageUrl: string;
  benefits: WhyUsBenefit[];
};

export type ProjectItem = {
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  fit: "cover" | "contain";
};

export type ProjectsData = {
  title: string;
  subtitle: string;
  items: ProjectItem[];
};

export type NewsData = {
  title: string;
  subtitle: string;
  limit: number;
  ctaLabel: string;
  ctaUrl: string;
};

export type GalleryData = {
  title: string;
  subtitle: string;
  slug: string;
  columns: number;
  caption: string;
};

export type ContactData = {
  title: string;
  subtitle: string;
  intro: string;
  recipient: string;
};

export type CtaData = {
  eyebrow: string;
  title: string;
  text: string;
  buttonLabel: string;
  buttonUrl: string;
};

export const DEFAULT_HERO: HeroData = {
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
  imageAlt: "Especialista técnico Palmaris em planta industrial com tablet de controle",
};

export const DEFAULT_SOLUTIONS: SolutionsData = {
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
};

export const DEFAULT_ABOUT: AboutData = {
  eyebrow: "SOBRE A PALMARIS",
  title: "Mais que representação,",
  highlightText: "somos integração de soluções.",
  subtitle: "",
  text: "A Palmaris Representações atua conectando empresas a soluções industriais de alta performance, com foco em automação, controle, monitoramento e eficiência operacional.",
  imageUrl: "/img/about-refinery.jpg",
  imageAlt: "Refinaria e planta industrial iluminada ao entardecer",
  features: [
    { title: "Experiência no setor industrial", icon: "user" },
    { title: "Parceiros estratégicos", icon: "handshake" },
    { title: "Soluções personalizadas", icon: "shield" },
    { title: "Compromisso com resultados", icon: "target" },
  ],
  pillars: [
    "Experiência no setor industrial",
    "Parceiros estratégicos",
    "Soluções personalizadas",
    "Compromisso com resultados",
  ],
};

export const DEFAULT_MARKETS: MarketsData = {
  title: "Mercados de atuação",
  subtitle: "Atendemos diversos segmentos industriais, com soluções sob medida para cada realidade.",
  ctaLabel: "Ver todos os mercados",
  ctaUrl: "/p/mercados",
  items: [
    { title: "Petroquímico e Químico", imageUrl: "/img/market-petroquimico.jpg", icon: "chemistry" },
    { title: "Alimentício e Bebidas", imageUrl: "/img/market-alimenticio.jpg", icon: "food" },
    { title: "Papel e Celulose", imageUrl: "/img/market-papel.jpg", icon: "paper" },
    { title: "Energia e Saneamento", imageUrl: "/img/market-energia.jpg", icon: "energy" },
    { title: "Metalúrgico e Manufatura", imageUrl: "/img/market-metalurgico.jpg", icon: "factory" },
  ],
};

export const DEFAULT_PARTNERS: PartnersData = {
  title: "Parceiros que ampliam possibilidades",
  subtitle: "Trabalhamos com as melhores marcas do mercado para entregar soluções completas e confiáveis.",
  items: [
    { name: "PESCO", category: "Automação & Controle", logoUrl: "/img/logo-pesco.png" },
    { name: "ENGEZER", category: "Engenharia e Equipamentos", logoUrl: "/img/logo-engezer.png" },
  ],
};

export const DEFAULT_WHY_US: WhyUsData = {
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
};

export const DEFAULT_PROJECTS: ProjectsData = {
  title: "NOSSOS PROJETOS",
  subtitle: "Casos de sucesso e implementações industriais",
  items: [],
};

export const DEFAULT_NEWS: NewsData = {
  title: "NOTÍCIAS E INSIGHTS",
  subtitle: "Novidades do setor industrial e tecnologia de processos",
  limit: 3,
  ctaLabel: "VER TODAS AS NOTÍCIAS",
  ctaUrl: "/noticias",
};

export const DEFAULT_GALLERY: GalleryData = {
  title: "GALERIA DE FOTOS",
  subtitle: "",
  slug: "",
  columns: 3,
  caption: "",
};

export const DEFAULT_CONTACT: ContactData = {
  title: "FALE COM A PALMARIS",
  subtitle: "",
  intro:
    "Preencha o formulário e nossa equipe de engenharia e consultoria técnica entrará em contato para entender sua demanda.",
  recipient: "",
};

export const DEFAULT_CTA: CtaData = {
  eyebrow: "VAMOS CONVERSAR?",
  title: "Sua operação mais eficiente começa com o parceiro certo.",
  text: "Fale com nossa equipe e descubra como a Palmaris pode ajudar o seu negócio.",
  buttonLabel: "Fale com um especialista",
  buttonUrl: "/p/contato",
};

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

/** Converte o JSON bruto do banco no tipo do bloco, com valores padrão seguros. */
export function parseBlockData(kind: string, data: unknown) {
  const raw = (data ?? {}) as Record<string, unknown>;

  const hero: HeroData = {
    eyebrow: asString(raw.eyebrow, DEFAULT_HERO.eyebrow),
    title: asString(raw.title, DEFAULT_HERO.title),
    highlightText: asString(raw.highlightText, DEFAULT_HERO.highlightText),
    subtitle: asString(raw.subtitle, DEFAULT_HERO.subtitle),
    ctaLabel: asString(raw.ctaLabel, DEFAULT_HERO.ctaLabel),
    ctaUrl: asString(raw.ctaUrl, DEFAULT_HERO.ctaUrl),
    secondaryCtaLabel: asString(raw.secondaryCtaLabel, DEFAULT_HERO.secondaryCtaLabel),
    secondaryCtaUrl: asString(raw.secondaryCtaUrl, DEFAULT_HERO.secondaryCtaUrl),
    imageUrl: asString(raw.imageUrl, DEFAULT_HERO.imageUrl),
    imageAlt: asString(raw.imageAlt, DEFAULT_HERO.imageAlt),
  };

  const solutionsItems: SolutionItem[] = Array.isArray(raw.items)
    ? raw.items.map((item) => {
        const obj = (item ?? {}) as Record<string, unknown>;
        return {
          title: asString(obj.title),
          description: asString(obj.description),
          icon: asString(obj.icon, "gear"),
          url: asString(obj.url),
        };
      })
    : DEFAULT_SOLUTIONS.items;

  const solutions: SolutionsData = {
    title: asString(raw.title, DEFAULT_SOLUTIONS.title),
    highlightText: asString(raw.highlightText, DEFAULT_SOLUTIONS.highlightText),
    subtitle: asString(raw.subtitle, DEFAULT_SOLUTIONS.subtitle),
    items: solutionsItems.length > 0 ? solutionsItems : DEFAULT_SOLUTIONS.items,
  };

  const aboutFeatures: AboutFeature[] = Array.isArray(raw.features)
    ? raw.features.map((item) => {
        const obj = (item ?? {}) as Record<string, unknown>;
        return {
          title: asString(obj.title),
          icon: asString(obj.icon, "shield"),
        };
      })
    : DEFAULT_ABOUT.features;

  const about: AboutData = {
    eyebrow: asString(raw.eyebrow, DEFAULT_ABOUT.eyebrow),
    title: asString(raw.title, DEFAULT_ABOUT.title),
    highlightText: asString(raw.highlightText, DEFAULT_ABOUT.highlightText),
    subtitle: asString(raw.subtitle, DEFAULT_ABOUT.subtitle),
    text: asString(raw.text, DEFAULT_ABOUT.text),
    imageUrl: asString(raw.imageUrl, DEFAULT_ABOUT.imageUrl),
    imageAlt: asString(raw.imageAlt, DEFAULT_ABOUT.imageAlt),
    features: aboutFeatures,
    pillars: asStringList(raw.pillars).length > 0 ? asStringList(raw.pillars) : DEFAULT_ABOUT.pillars,
  };

  const marketItems: MarketItem[] = Array.isArray(raw.items)
    ? raw.items.map((item) => {
        const obj = (item ?? {}) as Record<string, unknown>;
        return {
          title: asString(obj.title),
          imageUrl: asString(obj.imageUrl),
          icon: asString(obj.icon),
        };
      })
    : DEFAULT_MARKETS.items;

  const markets: MarketsData = {
    title: asString(raw.title, DEFAULT_MARKETS.title),
    subtitle: asString(raw.subtitle, DEFAULT_MARKETS.subtitle),
    ctaLabel: asString(raw.ctaLabel, DEFAULT_MARKETS.ctaLabel),
    ctaUrl: asString(raw.ctaUrl, DEFAULT_MARKETS.ctaUrl),
    items: marketItems.length > 0 ? marketItems : DEFAULT_MARKETS.items,
  };

  const partnerItems: PartnerItem[] = Array.isArray(raw.items)
    ? raw.items.map((item) => {
        const obj = (item ?? {}) as Record<string, unknown>;
        return {
          name: asString(obj.name),
          category: asString(obj.category),
          logoUrl: asString(obj.logoUrl),
        };
      })
    : DEFAULT_PARTNERS.items;

  const partners: PartnersData = {
    title: asString(raw.title, DEFAULT_PARTNERS.title),
    subtitle: asString(raw.subtitle, DEFAULT_PARTNERS.subtitle),
    items: partnerItems.length > 0 ? partnerItems : DEFAULT_PARTNERS.items,
  };

  const whyUsBenefits: WhyUsBenefit[] = Array.isArray(raw.benefits)
    ? raw.benefits.map((item) => {
        const obj = (item ?? {}) as Record<string, unknown>;
        return {
          title: asString(obj.title),
          description: asString(obj.description),
          icon: asString(obj.icon),
        };
      })
    : DEFAULT_WHY_US.benefits;

  const whyUs: WhyUsData = {
    cardTitle: asString(raw.cardTitle, DEFAULT_WHY_US.cardTitle),
    cardDescription: asString(raw.cardDescription, DEFAULT_WHY_US.cardDescription),
    imageUrl: asString(raw.imageUrl, DEFAULT_WHY_US.imageUrl),
    benefits: whyUsBenefits.length > 0 ? whyUsBenefits : DEFAULT_WHY_US.benefits,
  };

  const items: ProjectItem[] = Array.isArray(raw.items)
    ? raw.items.map((item) => {
        const obj = (item ?? {}) as Record<string, unknown>;
        return {
          title: asString(obj.title),
          description: asString(obj.description),
          imageUrl: asString(obj.imageUrl),
          imageAlt: asString(obj.imageAlt),
          fit: obj.fit === "contain" ? "contain" : "cover",
        };
      })
    : [];

  const projects: ProjectsData = {
    title: asString(raw.title, DEFAULT_PROJECTS.title),
    subtitle: asString(raw.subtitle, DEFAULT_PROJECTS.subtitle),
    items,
  };

  const limit = Number(raw.limit);
  const news: NewsData = {
    title: asString(raw.title, DEFAULT_NEWS.title),
    subtitle: asString(raw.subtitle, DEFAULT_NEWS.subtitle),
    limit: Number.isFinite(limit) && limit > 0 ? Math.min(limit, 12) : DEFAULT_NEWS.limit,
    ctaLabel: asString(raw.ctaLabel, DEFAULT_NEWS.ctaLabel),
    ctaUrl: asString(raw.ctaUrl, DEFAULT_NEWS.ctaUrl),
  };

  const galleryColumns = Number(raw.columns);
  const gallery: GalleryData = {
    title: asString(raw.title, DEFAULT_GALLERY.title),
    subtitle: asString(raw.subtitle, DEFAULT_GALLERY.subtitle),
    slug: asString(raw.slug, DEFAULT_GALLERY.slug),
    columns:
      Number.isFinite(galleryColumns) && galleryColumns > 0
        ? Math.min(galleryColumns, 6)
        : DEFAULT_GALLERY.columns,
    caption: asString(raw.caption, DEFAULT_GALLERY.caption),
  };

  const contact: ContactData = {
    title: asString(raw.title, DEFAULT_CONTACT.title),
    subtitle: asString(raw.subtitle, DEFAULT_CONTACT.subtitle),
    intro: asString(raw.intro, DEFAULT_CONTACT.intro),
    recipient: asString(raw.recipient, DEFAULT_CONTACT.recipient),
  };

  const cta: CtaData = {
    eyebrow: asString(raw.eyebrow, DEFAULT_CTA.eyebrow),
    title: asString(raw.title, DEFAULT_CTA.title),
    text: asString(raw.text, DEFAULT_CTA.text),
    buttonLabel: asString(raw.buttonLabel, DEFAULT_CTA.buttonLabel),
    buttonUrl: asString(raw.buttonUrl, DEFAULT_CTA.buttonUrl),
  };

  return { hero, solutions, about, markets, partners, why_us: whyUs, projects, news, gallery, contact, cta };
}

/** Normaliza o `kind` vindo do banco (valor desconhecido cai para "html"). */
export function normalizeKind(kind: string | null | undefined): BlockKind {
  return (BLOCK_KINDS as readonly string[]).includes(kind ?? "")
    ? (kind as BlockKind)
    : "html";
}
