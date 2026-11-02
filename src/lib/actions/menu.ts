"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guard";

export async function saveMenuItem(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim() || undefined;
  const label = String(formData.get("label") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const pageId = String(formData.get("pageId") ?? "").trim() || null;
  const parentId = String(formData.get("parentId") ?? "").trim() || null;
  const target = String(formData.get("target") ?? "_self").trim() || "_self";
  const menuOrder = Number(formData.get("menuOrder") ?? 0) || 0;
  const highlight = formData.get("highlight") === "on";
  const visible = formData.get("visible") === "on";

  if (!label) {
    return { error: "O texto do item é obrigatório." };
  }
  if (id && parentId === id) {
    return { error: "Um item não pode ser pai de si mesmo." };
  }

  const data = {
    label,
    url: url || null,
    pageId,
    parentId,
    target,
    menuOrder,
    highlight,
    visible,
  };

  if (id) {
    await prisma.menuItem.update({ where: { id }, data });
  } else {
    await prisma.menuItem.create({ data });
  }

  revalidatePath("/");
  revalidatePath("/admin/menu");
  redirect("/admin/menu");
}

export async function deleteMenuItem(id: string) {
  await requireAdmin();
  await prisma.menuItem.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/menu");
}
