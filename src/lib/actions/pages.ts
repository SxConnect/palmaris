"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guard";
import { slugify } from "@/lib/slugify";

async function uniqueSlug(base: string, excludeId?: string) {
  let slug = base || "pagina";
  let i = 0;
  while (true) {
    const existing = await prisma.page.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    i += 1;
    slug = `${base}-${i}`;
  }
}

export async function savePage(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim() || undefined;
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const published = formData.get("published") === "on";
  const showInMenu = formData.get("showInMenu") === "on";
  const menuOrder = Number(formData.get("menuOrder") ?? 0) || 0;

  if (!title) {
    return { error: "O título é obrigatório." };
  }

  const slug = await uniqueSlug(slugify(title), id);

  if (id) {
    await prisma.page.update({
      where: { id },
      data: { title, slug, content, published, showInMenu, menuOrder },
    });
  } else {
    await prisma.page.create({
      data: { title, slug, content, published, showInMenu, menuOrder },
    });
  }

  revalidatePath("/");
  revalidatePath("/noticias");
  revalidatePath("/admin/paginas");
  redirect("/admin/paginas");
}

export async function deletePage(id: string) {
  await requireAdmin();
  const page = await prisma.page.findUnique({ where: { id } });
  if (page?.slug === "home") {
    // A página inicial é essencial para o site — não pode ser removida.
    return;
  }
  await prisma.page.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/noticias");
  revalidatePath("/admin/paginas");
  if (page) revalidatePath(`/p/${page.slug}`);
}
