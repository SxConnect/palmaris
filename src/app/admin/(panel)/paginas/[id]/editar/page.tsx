import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { createSection } from "@/lib/actions/sections";

import { PageForm } from "../../PageForm";
import { SectionForm } from "../../SectionForm";

export const dynamic = "force-dynamic";

/**
 * Edição de uma página: dados da página + blocos (seções) do site.
 * Na página inicial (slug "home") é por aqui que se monta a home.
 */
export default async function EditPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const page = await prisma.page.findUnique({
    where: { id },
    include: { sections: { orderBy: { sectionOrder: "asc" } } },
  });
  if (!page) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Editar página</h1>
        <Link href="/admin/paginas" className="text-brand-700 hover:underline">
          ← Voltar
        </Link>
      </div>

      {page.slug === "home" ? (
        <div className="rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-800">
          Esta é a <strong>página inicial</strong>. Os blocos abaixo definem o que aparece em{" "}
          <code>/</code>.
        </div>
      ) : null}

      <div>
        <h2 className="mb-2 text-lg font-semibold">Dados da página</h2>
        <PageForm page={page} />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Blocos da página</h2>
          <form action={createSection.bind(null, page.id)}>
            <button type="submit" className="btn btn-primary text-xs">
              + Adicionar bloco
            </button>
          </form>
        </div>

        {page.sections.length === 0 ? (
          <p className="text-gray-500">
            Nenhum bloco ainda. Adicione blocos (capa, quem somos, projetos, notícias ou texto
            livre) para montar a página.
          </p>
        ) : (
          <div className="space-y-4">
            {page.sections.map((section) => (
              <SectionForm key={section.id} section={section} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
