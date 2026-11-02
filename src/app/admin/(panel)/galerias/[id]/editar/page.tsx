import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { galleryShortcode } from "@/lib/galleries";

import ShortcodeSnippet from "@/components/admin/ShortcodeSnippet";

import GalleryDetailsForm from "./GalleryDetailsForm";
import GalleryImagesManager from "./GalleryImagesManager";

export const dynamic = "force-dynamic";

/** Edição de uma galeria: dados, fotos e código de inserção. */
export default async function EditGalleryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const gallery = await prisma.gallery.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: { position: "asc" },
        include: { media: true },
      },
    },
  });
  if (!gallery) notFound();

  const images = gallery.images.map((item) => ({
    id: item.id,
    url: `/api/media/${item.mediaId}`,
    caption: item.caption,
    filename: item.media.filename,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{gallery.title}</h1>
        <Link href="/admin/galerias" className="text-brand-700 hover:underline">
          ← Voltar
        </Link>
      </div>

      <div className="rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-800">
        Insira esta galeria em qualquer notícia, página ou bloco de texto usando o shortcode
        abaixo (ou o botão “Galeria” do editor).
      </div>

      <ShortcodeSnippet code={galleryShortcode(gallery.slug)} />

      <GalleryDetailsForm gallery={gallery} />

      <GalleryImagesManager galleryId={gallery.id} images={images} />
    </div>
  );
}
