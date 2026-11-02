"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guard";
import { slugify } from "@/lib/slugify";

/** Garante que o slug da galeria seja único. */
async function uniqueSlug(base: string, excludeId?: string) {
  let slug = base || "galeria";
  let i = 0;
  while (true) {
    const existing = await prisma.gallery.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    i += 1;
    slug = `${base}-${i}`;
  }
}

/** Cria uma galeria de fotos. */
export async function createGallery(
  _prev: { error?: string; success?: string } | null,
  formData: FormData,
): Promise<{ error?: string; success?: string } | null> {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!title) return { error: "Informe o título da galeria." };

  const slug = await uniqueSlug(slugify(title));
  const gallery = await prisma.gallery.create({
    data: { title, slug, description: description || null },
  });

  revalidatePath("/admin/galerias");
  redirect(`/admin/galerias/${gallery.id}/editar`);
}

/** Atualiza os dados da galeria. */
export async function updateGallery(
  _prev: { error?: string; success?: string } | null,
  formData: FormData,
): Promise<{ error?: string; success?: string } | null> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!id || !title) return { error: "Informe o título da galeria." };

  await prisma.gallery.update({
    where: { id },
    data: { title, description: description || null },
  });

  revalidatePath("/admin/galerias");
  revalidatePath(`/admin/galerias/${id}/editar`);
  revalidatePath("/");
  return { success: "Galeria atualizada." };
}

/** Exclui a galeria (as imagens continuam na biblioteca de mídia). */
export async function deleteGallery(id: string) {
  await requireAdmin();
  await prisma.gallery.delete({ where: { id } });
  revalidatePath("/admin/galerias");
  revalidatePath("/");
  redirect("/admin/galerias");
}

/** Adiciona uma imagem da biblioteca de mídia à galeria. */
export async function addGalleryImage(galleryId: string, mediaId: string) {
  await requireAdmin();
  if (!galleryId || !mediaId) return;

  const last = await prisma.galleryImage.findFirst({
    where: { galleryId },
    orderBy: { position: "desc" },
  });

  await prisma.galleryImage.create({
    data: {
      galleryId,
      mediaId,
      position: (last?.position ?? -1) + 1,
    },
  });

  revalidatePath(`/admin/galerias/${galleryId}/editar`);
  revalidatePath("/");
}

/** Remove uma imagem da galeria. */
export async function removeGalleryImage(galleryId: string, imageId: string) {
  await requireAdmin();
  await prisma.galleryImage.delete({ where: { id: imageId } });
  revalidatePath(`/admin/galerias/${galleryId}/editar`);
  revalidatePath("/");
}

/** Atualiza a legenda de uma imagem. */
export async function updateGalleryImage(galleryId: string, imageId: string, caption: string) {
  await requireAdmin();
  await prisma.galleryImage.update({
    where: { id: imageId },
    data: { caption: caption.trim() || null },
  });
  revalidatePath(`/admin/galerias/${galleryId}/editar`);
  revalidatePath("/");
}

/** Move a imagem dentro da galeria. */
export async function moveGalleryImage(galleryId: string, imageId: string, direction: "up" | "down") {
  await requireAdmin();

  const images = await prisma.galleryImage.findMany({
    where: { galleryId },
    orderBy: { position: "asc" },
  });

  const index = images.findIndex((image) => image.id === imageId);
  if (index < 0) return;

  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= images.length) return;

  const current = images[index];
  const other = images[target];

  await prisma.galleryImage.update({
    where: { id: current.id },
    data: { position: other.position },
  });
  await prisma.galleryImage.update({
    where: { id: other.id },
    data: { position: current.position },
  });

  revalidatePath(`/admin/galerias/${galleryId}/editar`);
  revalidatePath("/");
}
