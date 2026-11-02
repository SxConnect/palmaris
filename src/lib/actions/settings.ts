"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guard";
import { saveSiteSettings, type SiteSettings } from "@/lib/site-settings";

/** Salva as configurações gerais do site (rodapé, logotipo, redes sociais). */
export async function saveSettings(
  _prev: { error?: string; success?: string } | null,
  formData: FormData,
): Promise<{ error?: string; success?: string } | null> {
  await requireAdmin();

  const settings: SiteSettings = {
    siteName: String(formData.get("siteName") ?? "").trim(),
    tagline: String(formData.get("tagline") ?? "").trim(),
    logoUrl: String(formData.get("logoUrl") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
    cnpj: String(formData.get("cnpj") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    facebookUrl: String(formData.get("facebookUrl") ?? "").trim(),
    instagramUrl: String(formData.get("instagramUrl") ?? "").trim(),
    linkedinUrl: String(formData.get("linkedinUrl") ?? "").trim(),
    footerNote: String(formData.get("footerNote") ?? "").trim(),
  };

  if (!settings.siteName) {
    return { error: "Informe o nome do site." };
  }

  await saveSiteSettings(settings);

  revalidatePath("/");
  revalidatePath("/admin/configuracoes");
  return { success: "Configurações salvas." };
}
