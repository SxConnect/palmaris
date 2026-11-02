"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guard";
import { normalizeKind } from "@/lib/blocks";
import type { Prisma } from "@/generated/prisma/client";

/** Converte os campos do formulário no JSON do bloco, conforme o tipo. */
function buildBlockData(kind: string, formData: FormData): Prisma.InputJsonValue {
  const title = String(formData.get("title") ?? "").trim();
  const subtitle = String(formData.get("subtitle") ?? "").trim();

  switch (kind) {
    case "hero":
      return {
        eyebrow: String(formData.get("eyebrow") ?? "").trim(),
        title,
        highlightText: String(formData.get("highlightText") ?? "").trim(),
        subtitle,
        ctaLabel: String(formData.get("ctaLabel") ?? "").trim(),
        ctaUrl: String(formData.get("ctaUrl") ?? "").trim(),
        secondaryCtaLabel: String(formData.get("secondaryCtaLabel") ?? "").trim(),
        secondaryCtaUrl: String(formData.get("secondaryCtaUrl") ?? "").trim(),
        imageUrl: String(formData.get("imageUrl") ?? "").trim(),
        imageAlt: String(formData.get("imageAlt") ?? "").trim(),
      };

    case "solutions": {
      let items: Prisma.InputJsonValue = [];
      try {
        const parsed = JSON.parse(String(formData.get("items") ?? "[]"));
        if (Array.isArray(parsed)) items = parsed as Prisma.InputJsonValue;
      } catch {
        items = [];
      }
      return {
        title,
        highlightText: String(formData.get("highlightText") ?? "").trim(),
        subtitle,
        items,
      };
    }

    case "about":
      return {
        eyebrow: String(formData.get("eyebrow") ?? "").trim(),
        title,
        highlightText: String(formData.get("highlightText") ?? "").trim(),
        subtitle,
        text: String(formData.get("text") ?? "").trim(),
        imageUrl: String(formData.get("imageUrl") ?? "").trim(),
        imageAlt: String(formData.get("imageAlt") ?? "").trim(),
        pillars: String(formData.get("pillars") ?? "")
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
      };

    case "markets": {
      let items: Prisma.InputJsonValue = [];
      try {
        const parsed = JSON.parse(String(formData.get("items") ?? "[]"));
        if (Array.isArray(parsed)) items = parsed as Prisma.InputJsonValue;
      } catch {
        items = [];
      }
      return {
        title,
        subtitle,
        ctaLabel: String(formData.get("ctaLabel") ?? "").trim(),
        ctaUrl: String(formData.get("ctaUrl") ?? "").trim(),
        items,
      };
    }

    case "partners": {
      let items: Prisma.InputJsonValue = [];
      try {
        const parsed = JSON.parse(String(formData.get("items") ?? "[]"));
        if (Array.isArray(parsed)) items = parsed as Prisma.InputJsonValue;
      } catch {
        items = [];
      }
      return {
        title,
        subtitle,
        items,
      };
    }

    case "why_us": {
      let benefits: Prisma.InputJsonValue = [];
      try {
        const parsed = JSON.parse(String(formData.get("benefits") ?? "[]"));
        if (Array.isArray(parsed)) benefits = parsed as Prisma.InputJsonValue;
      } catch {
        benefits = [];
      }
      return {
        cardTitle: String(formData.get("cardTitle") ?? title).trim(),
        cardDescription: String(formData.get("cardDescription") ?? subtitle).trim(),
        imageUrl: String(formData.get("imageUrl") ?? "").trim(),
        benefits,
      };
    }

    case "projects": {
      let items: Prisma.InputJsonValue = [];
      try {
        const parsed = JSON.parse(String(formData.get("items") ?? "[]"));
        if (Array.isArray(parsed)) items = parsed as Prisma.InputJsonValue;
      } catch {
        items = [];
      }
      return { title, subtitle, items };
    }

    case "news":
      return {
        title,
        subtitle,
        limit: Number(formData.get("limit") ?? 3) || 3,
        ctaLabel: String(formData.get("ctaLabel") ?? "").trim(),
        ctaUrl: String(formData.get("ctaUrl") ?? "").trim(),
      };

    case "gallery":
      return {
        title,
        subtitle,
        slug: String(formData.get("slug") ?? "").trim(),
        columns: Number(formData.get("columns") ?? 3) || 3,
        caption: String(formData.get("caption") ?? "").trim(),
      };

    case "contact":
      return {
        title,
        subtitle,
        intro: String(formData.get("intro") ?? "").trim(),
        recipient: String(formData.get("recipient") ?? "").trim(),
      };

    case "cta":
      return {
        title,
        text: String(formData.get("text") ?? "").trim(),
        buttonLabel: String(formData.get("buttonLabel") ?? "").trim(),
        buttonUrl: String(formData.get("buttonUrl") ?? "").trim(),
      };

    default:
      return { title, subtitle };
  }
}

export async function createSection(pageId: string) {
  await requireAdmin();
  const section = await prisma.section.create({
    data: { pageId, kind: "html", content: "<p>Novo bloco</p>", sectionOrder: 999 },
  });
  revalidatePath(`/admin/paginas/${pageId}/editar`);
  redirect(`/admin/paginas/${pageId}/editar#bloco-${section.id}`);
}

export async function saveSection(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim() || undefined;
  const pageId = String(formData.get("pageId") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const visible = formData.get("visible") === "on";
  const sectionOrder = Number(formData.get("sectionOrder") ?? 0) || 0;
  const kind = normalizeKind(String(formData.get("kind") ?? "html"));

  if (!pageId) {
    return { error: "Página é obrigatória." };
  }

  const data = buildBlockData(kind, formData);

  const payload = {
    pageId,
    title: label || null,
    kind,
    content: kind === "html" ? content : "",
    data,
    visible,
    sectionOrder,
  };

  if (id) {
    await prisma.section.update({ where: { id }, data: payload });
  } else {
    await prisma.section.create({ data: payload });
  }

  revalidatePath("/");
  revalidatePath("/noticias");
  revalidatePath("/admin/paginas");
  redirect(`/admin/paginas/${pageId}/editar`);
}

export async function deleteSection(id: string, pageId: string) {
  await requireAdmin();
  await prisma.section.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/noticias");
  revalidatePath("/admin/paginas");
  redirect(`/admin/paginas/${pageId}/editar`);
}

/** Move o bloco uma posição acima ou abaixo na ordenação da página. */
export async function moveSection(id: string, direction: "up" | "down") {
  await requireAdmin();
  const section = await prisma.section.findUnique({ where: { id } });
  if (!section) return;

  const sibling = await prisma.section.findFirst({
    where: {
      pageId: section.pageId,
      sectionOrder: {
        ...(direction === "up" ? { lt: section.sectionOrder } : { gt: section.sectionOrder }),
      },
    },
    orderBy: { sectionOrder: direction === "up" ? "desc" : "asc" },
  });
  if (!sibling) return;

  const currentOrder = section.sectionOrder;
  await prisma.section.update({
    where: { id: section.id },
    data: { sectionOrder: sibling.sectionOrder },
  });
  await prisma.section.update({
    where: { id: sibling.id },
    data: { sectionOrder: currentOrder },
  });

  revalidatePath("/");
  revalidatePath(`/admin/paginas/${section.pageId}/editar`);
}
