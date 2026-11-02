import { prisma } from "@/lib/prisma";
import {
  DEFAULT_HERO,
  DEFAULT_SOLUTIONS,
  DEFAULT_ABOUT,
  DEFAULT_MARKETS,
  DEFAULT_PARTNERS,
  DEFAULT_WHY_US,
  DEFAULT_CTA,
} from "@/lib/blocks";
import BlockRenderer from "@/components/blocks/BlockRenderer";

export const dynamic = "force-dynamic";

/**
 * Página inicial da Palmaris Representações:
 * Gerenciada pelo CMS. Se o banco ainda não tiver sido populado com o seed,
 * exibe a estrutura completa padrão fiel ao mockup de layout.
 */
export default async function HomePage() {
  let sections: Array<{
    id: string;
    kind: string;
    title: string | null;
    content: string;
    data: unknown;
  }> = [];

  try {
    const page = await prisma.page.findUnique({
      where: { slug: "home" },
      include: {
        sections: { where: { visible: true }, orderBy: { sectionOrder: "asc" } },
      },
    });

    if (page?.published && page.sections.length > 0) {
      sections = page.sections.map((s) => ({
        id: s.id,
        kind: s.kind,
        title: s.title,
        content: s.content,
        data: s.data,
      }));
    }
  } catch {
    // Caso o banco ainda não esteja conectado, exibe o fallback padrão
    sections = [];
  }

  // Fallback seguro caso o banco ainda esteja vazio
  if (sections.length === 0) {
    sections = [
      { id: "default-hero", kind: "hero", title: "Capa", content: "", data: DEFAULT_HERO },
      { id: "default-solutions", kind: "solutions", title: "Nossas soluções", content: "", data: DEFAULT_SOLUTIONS },
      { id: "default-about", kind: "about", title: "Sobre a Palmaris", content: "", data: DEFAULT_ABOUT },
      { id: "default-markets", kind: "markets", title: "Mercados de atuação", content: "", data: DEFAULT_MARKETS },
      { id: "default-partners", kind: "partners", title: "Parceiros", content: "", data: DEFAULT_PARTNERS },
      { id: "default-why-us", kind: "why_us", title: "Por que escolher a Palmaris", content: "", data: DEFAULT_WHY_US },
      { id: "default-cta", kind: "cta", title: "Chamada de ação", content: "", data: DEFAULT_CTA },
    ];
  }

  return (
    <>
      {sections.map((section) => (
        <BlockRenderer key={section.id} section={section} />
      ))}
    </>
  );
}
