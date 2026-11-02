import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

import GalleryLightbox, { type GalleryImageData } from "@/components/site/GalleryLightbox";

/**
 * Galeria de fotos do site (renderizada a partir do shortcode `[galeria]`).
 */
export default async function GalleryView({
  slug,
  columns = 3,
  caption,
}: {
  slug: string;
  columns?: number;
  caption?: string;
}) {
  const gallery = await prisma.gallery.findUnique({
    where: { slug },
    include: {
      images: {
        orderBy: { position: "asc" },
        include: { media: true },
      },
    },
  });

  if (!gallery) {
    return (
      <p className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-500">
        Galeria “{slug}” não encontrada. Verifique o shortcode inserido.
      </p>
    );
  }

  const images: GalleryImageData[] = gallery.images.map((item) => ({
    id: item.id,
    url: `/api/media/${item.mediaId}`,
    caption: item.caption,
    alt: item.media.altText ?? item.caption ?? gallery.title,
  }));

  return (
    <figure className="my-8 not-prose">
      {gallery.title ? (
        <h3 className="mb-3 text-lg font-bold text-neutral-900">{gallery.title}</h3>
      ) : null}
      <GalleryLightbox images={images} columns={columns} />
      {caption || gallery.description ? (
        <figcaption className="mt-3 text-sm text-neutral-600">
          {caption ?? gallery.description}
        </figcaption>
      ) : null}
    </figure>
  );
}
