"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guard";
import { slugify } from "@/lib/slugify";
import { createMediaFromFile } from "@/lib/actions/media";

async function uniqueSlug(base: string, excludeId?: string) {
  let slug = base || "post";
  let i = 0;
  while (true) {
    const existing = await prisma.post.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    i += 1;
    slug = `${base}-${i}`;
  }
}

export async function savePost(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim() || undefined;
  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const published = formData.get("published") === "on";
  const showOnHome = formData.get("showOnHome") === "on";

  if (!title || !content) {
    return { error: "Título e conteúdo são obrigatórios." };
  }

  const file = formData.get("cover") as File | null;
  let coverImageId: string | undefined;
  if (file && file.size > 0) {
    coverImageId = await createMediaFromFile(file);
  }

  const slug = await uniqueSlug(slugify(title), id);

  if (id) {
    await prisma.post.update({
      where: { id },
      data: {
        title,
        slug,
        excerpt: excerpt || null,
        content,
        category: category || null,
        published,
        showOnHome,
        ...(coverImageId ? { coverImageId } : {}),
      },
    });
  } else {
    await prisma.post.create({
      data: {
        title,
        slug,
        excerpt: excerpt || null,
        content,
        category: category || null,
        published,
        showOnHome,
        coverImageId: coverImageId ?? null,
      },
    });
  }

  revalidatePath("/");
  revalidatePath("/noticias");
  revalidatePath("/admin/noticias");
  redirect("/admin/noticias");
}

export async function deletePost(id: string) {
  await requireAdmin();
  const post = await prisma.post.findUnique({ where: { id } });
  await prisma.post.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/noticias");
  revalidatePath("/admin/noticias");
  if (post) revalidatePath(`/noticias/${post.slug}`);
}
