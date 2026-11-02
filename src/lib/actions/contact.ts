"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { sendContactEmail } from "@/lib/email";
import { getSiteSettings } from "@/lib/site-settings";

/**
 * Formulário de contato do site.
 *
 * A mensagem é sempre gravada no banco (aparece em /admin/mensagens) e,
 * quando o SMTP está configurado, também é enviada por e-mail para a
 * associação.
 */

/** Limite simples: no máximo 3 mensagens por IP a cada 10 minutos. */
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 3;
const recentSubmissions = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const times = (recentSubmissions.get(ip) ?? []).filter(
    (time) => now - time < RATE_LIMIT_WINDOW_MS,
  );

  if (times.length >= RATE_LIMIT_MAX) {
    recentSubmissions.set(ip, times);
    return true;
  }

  times.push(now);
  recentSubmissions.set(ip, times);
  return false;
}

async function getClientIp(): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headerList.get("x-real-ip") ?? "desconhecido";
}

export async function sendContactMessage(
  _prev: { error?: string; success?: string } | null,
  formData: FormData,
): Promise<{ error?: string; success?: string } | null> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  // Campo isca (honeypot): invisível para humanos, preenchido por robôs.
  const honeypot = String(formData.get("website") ?? "").trim();
  if (honeypot) {
    return { success: "Mensagem enviada. Agradecemos o contato!" };
  }

  if (!name || !email || !message) {
    return { error: "Preencha nome, e-mail e mensagem." };
  }
  if (!email.includes("@") || !email.includes(".")) {
    return { error: "Informe um e-mail válido." };
  }
  if (message.length < 10) {
    return { error: "Escreva uma mensagem um pouco mais longa (mínimo 10 caracteres)." };
  }
  if (message.length > 5000) {
    return { error: "A mensagem é muito longa (máximo 5000 caracteres)." };
  }

  const ip = await getClientIp();
  if (isRateLimited(ip)) {
    return { error: "Você já enviou várias mensagens. Aguarde alguns minutos e tente de novo." };
  }

  const settings = await getSiteSettings();
  const to = settings.email;
  const finalSubject = subject || "Contato pelo site";

  // 1. Guarda a mensagem (caixa de entrada no painel).
  await prisma.contactMessage.create({
    data: { name, email, subject: finalSubject, message, ip },
  });

  // 2. Envia por e-mail, se houver SMTP configurado.
  let emailed = false;
  try {
    emailed = await sendContactEmail({ to, name, email, subject: finalSubject, message });
  } catch (error) {
    console.error("[contato] falha no envio do e-mail:", error);
  }

  revalidatePath("/admin/mensagens");

  return {
    success: emailed
      ? "Mensagem enviada! Nossa equipe responde em breve."
      : "Mensagem recebida! Nossa equipe responde em breve.",
  };
}
