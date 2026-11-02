import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Lista da biblioteca de mídia (usada pelo seletor de imagens do painel).
 * A resposta traz apenas metadados — os bytes são servidos em /api/media/[id].
 */
export async function GET() {
  const items = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, filename: true, mimeType: true, size: true, altText: true },
  });

  return NextResponse.json(
    items.map((item) => ({
      id: item.id,
      filename: item.filename,
      mimeType: item.mimeType,
      size: item.size,
      altText: item.altText,
      url: `/api/media/${item.id}`,
    })),
  );
}
