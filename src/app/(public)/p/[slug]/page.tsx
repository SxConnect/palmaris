import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

import BlockRenderer from "@/components/blocks/BlockRenderer";
import RichContent from "@/components/RichContent";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const page = await prisma.page.findUnique({ where: { slug } });
    if (page) return { title: page.title };
  } catch {
    // fallback
  }

  const titles: Record<string, string> = {
    solucoes: "Soluções Industriais",
    mercados: "Mercados de Atuação",
    parceiros: "Parceiros Oficiais",
    projetos: "Projetos e Cases",
    contato: "Contato com Especialista",
  };

  return { title: titles[slug] || "Página Institucional" };
}

/**
 * Páginas criadas no painel (Quem Somos, Nossa Luta, Transparência, Contato...).
 * Uma página pode ter blocos estruturados e/ou HTML livre.
 */
export default async function CmsPage({ params }: Props) {
  const { slug } = await params;
  let page = null;

  try {
    page = await prisma.page.findUnique({
      where: { slug },
      include: {
        sections: { where: { visible: true }, orderBy: { sectionOrder: "asc" } },
      },
    });
  } catch {
    page = null;
  }

  // Fallbacks para páginas padrões enquanto o seed não é rodado
  if (!page) {
    const defaults: Record<string, { title: string; content: string }> = {
      solucoes: {
        title: "Soluções Industriais",
        content: `
          <h2>Engenharia, Automação e Soluções de Alta Tecnologia</h2>
          <p>A Palmaris Representações atua com soluções completas para indústrias químicas, petroquímicas, alimentícias, de celulose e saneamento.</p>
          <ul>
            <li>Automação e controle com CLPs e supervisórios de última geração</li>
            <li>Montagem e comissionamento de painéis elétricos industriais</li>
            <li>Monitoramento contínuo de emissões atmosféricas e efluentes (ETEs)</li>
            <li>Eficiência em combustão e queima industrial</li>
          </ul>
        `,
      },
      mercados: {
        title: "Mercados de Atuação",
        content: `
          <h2>Segmentos Industriais Atendidos</h2>
          <p>Compreendemos as particularidades operacionais de cada setor com soluções customizadas.</p>
          <ul>
            <li>Petroquímico e Químico</li>
            <li>Alimentício e Bebidas</li>
            <li>Papel e Celulose</li>
            <li>Energia e Saneamento</li>
            <li>Metalúrgico e Manufatura</li>
          </ul>
        `,
      },
      parceiros: {
        title: "Parceiros Oficiais",
        content: `
          <h2>Parcerias Estratégicas</h2>
          <p>Trabalhamos em conjunto com marcas líderes do mercado nacional e global:</p>
          <ul>
            <li><strong>PESCO:</strong> Automação & Controle</li>
            <li><strong>EMGEZER:</strong> Equipamentos e Soluções Industriais</li>
          </ul>
        `,
      },
      projetos: {
        title: "Projetos e Cases",
        content: `
          <h2>Aplicações de Alta Performance</h2>
          <p>Implementações com foco em redução de perdas, segurança operacional e eficiência energética no parque industrial brasileiro.</p>
        `,
      },
      contato: {
        title: "Fale com um Especialista",
        content: "<p>Entre em contato direto com nossos consultores técnicos para tirar dúvidas ou solicitar uma proposta comercial.</p>",
      },
    };

    if (defaults[slug]) {
      page = {
        id: `default-${slug}`,
        title: defaults[slug].title,
        slug,
        content: defaults[slug].content,
        published: true,
        showInMenu: true,
        menuOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        sections: slug === "contato" ? [
          {
            id: "contact-sec",
            pageId: "default-contato",
            title: "Contato",
            kind: "contact",
            content: "",
            data: {
              title: "FALE COM UM ESPECIALISTA",
              subtitle: "Preencha seus dados para receber nosso contato consultivo.",
              intro: "Nossa equipe de consultoria técnica está à disposição para analisar suas necessidades operacionais.",
              recipient: "contato@palmarisrepresentacoes.com.br",
            },
            visible: true,
            sectionOrder: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        ] : [],
      };
    }
  }

  if (!page || !page.published) notFound();

  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-slate-900 py-12 text-white sm:py-16">
        <div className="absolute inset-0 bg-gradient-to-r from-[#06152d] via-brand-950 to-slate-950 opacity-95" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {page.title}
          </h1>
        </div>
      </section>

      {page.content?.trim() ? (
        <section className="py-12 sm:py-16">
          <RichContent
            html={page.content}
            className="almzo-prose mx-auto max-w-3xl px-4 sm:px-6"
          />
        </section>
      ) : null}

      {page.sections.map((section) => (
        <BlockRenderer
          key={section.id}
          section={{
            id: section.id,
            kind: section.kind,
            title: section.title,
            content: section.content,
            data: section.data,
          }}
        />
      ))}
    </div>
  );
}
