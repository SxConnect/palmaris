import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { deletePage } from "@/lib/actions/pages";

export const dynamic = "force-dynamic";

/** Lista de páginas do site. A página "home" é a página inicial. */
export default async function PagesListPage() {
  const pages = await prisma.page.findMany({
    orderBy: [{ slug: "asc" }, { menuOrder: "asc" }],
    include: { _count: { select: { sections: true } } },
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Páginas</h1>
        <Link href="/admin/paginas/nova" className="btn btn-primary">
          Nova página
        </Link>
      </div>

      <p className="mb-4 text-sm text-gray-600">
        A página <strong>home</strong> é a página inicial do site: edite os blocos (capa, quem
        somos, projetos, notícias) em “Editar blocos”.
      </p>

      {pages.length === 0 ? (
        <p className="text-gray-500">Nenhuma página.</p>
      ) : (
        <div className="space-y-2">
          {pages.map((page) => (
            <div key={page.id} className="card flex items-center justify-between gap-3">
              <div>
                <Link
                  href={`/admin/paginas/${page.id}/editar`}
                  className="font-semibold hover:underline"
                >
                  {page.title}
                </Link>
                <span className="ml-2 text-xs text-gray-500">/p/{page.slug}</span>
                <span className="ml-2 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                  {page._count.sections} blocos
                </span>
                {page.slug === "home" ? (
                  <span className="ml-2 rounded bg-brand-100 px-2 py-0.5 text-xs text-brand-700">
                    página inicial
                  </span>
                ) : null}
                {page.showInMenu ? (
                  <span className="ml-2 rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                    menu
                  </span>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/admin/paginas/${page.id}/editar`} className="btn text-xs">
                  Editar blocos
                </Link>
                {page.slug === "home" ? null : (
                  <form action={deletePage.bind(null, page.id)}>
                    <button type="submit" className="btn btn-danger text-xs">
                      Excluir
                    </button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
