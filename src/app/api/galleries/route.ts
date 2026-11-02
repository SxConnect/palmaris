import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Lista as galerias disponíveis (usada pelo editor para inserir o shortcode).
 */
export async function GET() {
  const galleries = await prisma.gallery.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      _count: { select: { images: true } },
    },
  });

  return NextResponse.json(
    galleries.map((gallery) => ({
      id: gallery.id,
      title: gallery.title,
      slug: gallery.slug,
      count: gallery._count.images,
    })),
  );
}
