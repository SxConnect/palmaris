import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site-settings";
import SiteNav from "@/components/site/SiteNav";

/**
 * Cabeçalho do site: logotipo à esquerda, links de navegação e botão de ação
 * "Fale com um especialista" à direita conforme o mockup da Palmaris.
 */
export default async function SiteHeader() {
  const [settings, menuItems] = await Promise.all([
    getSiteSettings(),
    prisma.menuItem.findMany({
      where: { visible: true, parentId: null },
      orderBy: { menuOrder: "asc" },
      include: { page: { select: { slug: true } } },
    }),
  ]);

  const DEFAULT_MENU = [
    { id: "m-solucoes", label: "Soluções", url: "/p/solucoes", highlight: false },
    { id: "m-mercados", label: "Mercados", url: "/p/mercados", highlight: false },
    { id: "m-parceiros", label: "Parceiros", url: "/p/parceiros", highlight: false },
    { id: "m-projetos", label: "Projetos", url: "/p/projetos", highlight: false },
    { id: "m-contato", label: "Contato", url: "/p/contato", highlight: false },
    { id: "m-cta", label: "Fale com um especialista", url: "/p/contato", highlight: true },
  ];

  const items =
    menuItems.length > 0
      ? menuItems.map((item) => ({
          id: item.id,
          label: item.label,
          url: item.url ?? (item.page ? `/p/${item.page.slug}` : "#"),
          highlight: item.highlight,
        }))
      : DEFAULT_MENU;

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex shrink-0 items-center">
          <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="Página inicial Palmaris">
            {settings.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.logoUrl}
                alt={settings.siteName}
                className="h-12 w-auto object-contain sm:h-14"
              />
            ) : (
              <span className="text-2xl font-black tracking-tight text-neutral-900">
                PALMARIS
              </span>
            )}
          </Link>
        </div>

        <SiteNav items={items} />
      </div>
    </header>
  );
}
