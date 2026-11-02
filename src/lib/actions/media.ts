"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guard";

/**
 * Guarda um arquivo enviado pelo painel dentro do banco.
 * O site não depende de filesystem — funciona igual em Docker, VPS ou Vercel.
 */
export async function createMediaFromFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const data = Buffer.from(arrayBuffer);
  const media = await prisma.media.create({
    data: {
      filename: file.name || "upload",
      mimeType: file.type || "application/octet-stream",
      data,
      size: data.length,
    },
  });
  return media.id;
}

/** Envia uma imagem para a biblioteca de mídia. */
export async function uploadMedia(
  _prev: { error?: string; success?: string } | null,
  formData: FormData,
): Promise<{ error?: string; success?: string } | null> {
  await requireAdmin();

  const file = formData.get("file") as File | null;
  const altText = String(formData.get("altText") ?? "").trim();

  if (!file || file.size === 0) {
    return { error: "Selecione um arquivo." };
  }
  if (!file.type.startsWith("image/")) {
    return { error: "Envie um arquivo de imagem (JPG, PNG, WebP ou SVG)." };
  }
  if (file.size > 8 * 1024 * 1024) {
    return { error: "A imagem deve ter no máximo 8 MB." };
  }

  const arrayBuffer = await file.arrayBuffer();
  const data = Buffer.from(arrayBuffer);

  await prisma.media.create({
    data: {
      filename: file.name || "upload",
      mimeType: file.type || "application/octet-stream",
      data,
      size: data.length,
      altText: altText || null,
    },
  });

  revalidatePath("/admin/midia");
  return { success: "Imagem enviada." };
}

/** Remove uma imagem da biblioteca. */
export async function deleteMedia(id: string) {
  await requireAdmin();
  await prisma.media.delete({ where: { id } });
  revalidatePath("/admin/midia");
  redirect("/admin/midia");
}
