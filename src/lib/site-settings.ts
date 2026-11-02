import "server-only";

import { cache } from "react";

import { prisma } from "@/lib/prisma";

/**
 * Configurações gerais do site, editáveis pelo painel em /admin/configuracoes.
 * Tudo fica em uma única linha da tabela `settings` (chave "site") com o
 * valor em JSON — assim é fácil exportar/importar e não exige migration
 * a cada novo campo.
 */
export type SiteSettings = {
  /** Nome curto, usado no título do navegador. */
  siteName: string;
  /** Frase de apoio (usada no rodapé e em SEO). */
  tagline: string;
  /** Caminho ou URL do logotipo exibido no cabeçalho. */
  logoUrl: string;
  /** Endereço completo exibido no rodapé. */
  address: string;
  /** CNPJ exibido no rodapé. */
  cnpj: string;
  /** E-mail de contato exibido no rodapé. */
  email: string;
  /** Telefone/whatsapp (opcional). */
  phone: string;
  /** Link do Facebook (opcional). */
  facebookUrl: string;
  /** Link do Instagram (opcional). */
  instagramUrl: string;
  /** Link do LinkedIn (opcional). */
  linkedinUrl: string;
  /** Texto extra do rodapé (opcional). */
  footerNote: string;
};

export const DEFAULT_SETTINGS: SiteSettings = {
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
  footerNote: "Representação e integração de soluções industriais de alta performance.",
};

const SETTINGS_KEY = "site";

/**
 * Normaliza um link: aceita "facebook.com/almzo" e transforma em
 * "https://facebook.com/almzo" (sem link quebrado no rodapé).
 */
export function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) return trimmed;
  if (/^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

function mergeSettings(value: unknown): SiteSettings {
  if (!value || typeof value !== "object") return { ...DEFAULT_SETTINGS };
  const raw = value as Partial<Record<keyof SiteSettings, unknown>>;
  const result = { ...DEFAULT_SETTINGS };
  for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof SiteSettings)[]) {
    const item = raw[key];
    if (typeof item === "string") result[key] = item;
  }
  return result;
}

/** Lê as configurações do site (cache por requisição). */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const row = await prisma.setting.findUnique({ where: { key: SETTINGS_KEY } });
  return mergeSettings(row?.value);
});

/** Grava as configurações do site. */
export async function saveSiteSettings(settings: SiteSettings): Promise<void> {
  const value = {
    ...DEFAULT_SETTINGS,
    ...settings,
    facebookUrl: normalizeUrl(settings.facebookUrl),
    instagramUrl: normalizeUrl(settings.instagramUrl),
    linkedinUrl: normalizeUrl(settings.linkedinUrl),
  };
  await prisma.setting.upsert({
    where: { key: SETTINGS_KEY },
    update: { value },
    create: { key: SETTINGS_KEY, value },
  });
}
