import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { deleteGallery } from "@/lib/actions/galleries";

import GalleryCreateForm from "./GalleryCreateForm";

export const dynamic = "force-dynamic";

/** Lista de galerias de fotos. */
export default async function GalleriesPage() {
  const galleries = await prisma.gallery.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { images: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Galerias de fotos</h1>
        <p className="mt-1 text-sm text-gray-600">
          Crie galerias e insira-as em notícias ou páginas com o shortcode{" "}
          <code className="rounded bg-gray-200 px-1">[galeria slug=&quot;...&quot;]</code>.
        </p>
      </div>

      <GalleryCreateForm />

      {galleries.length === 0 ? (
        <p className="text-gray-500">Nenhuma galeria criada ainda.</p>
      ) : (
        <div className="space-y-2">
          {galleries.map((gallery) => (
            <div key={gallery.id} className="card flex items-center justify-between gap-3">
              <div>
                <Link
                  href={`/admin/galerias/${gallery.id}/editar`}
                  className="font-semibold hover:underline"
                >
                  {gallery.title}
                </Link>
                <span className="ml-2 text-xs text-gray-500">
                  {gallery._count.images} foto(s) · slug: {gallery.slug}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/admin/galerias/${gallery.id}/editar`} className="btn text-xs">
                  Editar
                </Link>
                <form action={deleteGallery.bind(null, gallery.id)}>
                  <button type="submit" className="btn btn-danger text-xs">
                    Excluir
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
