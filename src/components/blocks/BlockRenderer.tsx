import { normalizeKind, parseBlockData } from "@/lib/blocks";

import AboutBlock from "@/components/blocks/AboutBlock";
import ContactBlock from "@/components/blocks/ContactBlock";
import CtaBlock from "@/components/blocks/CtaBlock";
import GalleryBlock from "@/components/blocks/GalleryBlock";
import HeroBlock from "@/components/blocks/HeroBlock";
import HtmlBlock from "@/components/blocks/HtmlBlock";
import MarketsBlock from "@/components/blocks/MarketsBlock";
import NewsBlock from "@/components/blocks/NewsBlock";
import PartnersBlock from "@/components/blocks/PartnersBlock";
import ProjectsBlock from "@/components/blocks/ProjectsBlock";
import SolutionsBlock from "@/components/blocks/SolutionsBlock";
import WhyUsBlock from "@/components/blocks/WhyUsBlock";

export type RenderableSection = {
  id: string;
  kind: string;
  title: string | null;
  content: string;
  data: unknown;
};

/**
 * Renderiza um bloco da página de acordo com o seu `kind`.
 * Cada tipo de bloco tem um componente próprio, o que garante que o layout
 * continue correto mesmo depois de edições no painel administrativo.
 */
export default function BlockRenderer({ section }: { section: RenderableSection }) {
  const kind = normalizeKind(section.kind);
  const data = parseBlockData(kind, section.data);

  switch (kind) {
    case "hero":
      return <HeroBlock data={data.hero} />;
    case "solutions":
      return <SolutionsBlock data={data.solutions} />;
    case "about":
      return <AboutBlock data={data.about} />;
    case "markets":
      return <MarketsBlock data={data.markets} />;
    case "partners":
      return <PartnersBlock data={data.partners} />;
    case "why_us":
      return <WhyUsBlock data={data.why_us} />;
    case "projects":
      return <ProjectsBlock data={data.projects} />;
    case "news":
      return <NewsBlock data={data.news} />;
    case "gallery":
      return <GalleryBlock data={data.gallery} />;
    case "contact":
      return <ContactBlock data={data.contact} />;
    case "cta":
      return <CtaBlock data={data.cta} />;
    default:
      return <HtmlBlock content={section.content} />;
  }
}
