"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { requireAuth } from "@/lib/auth/guard";
import { sendJmapEmail, uploadBlob } from "@/lib/jmap";

const DEFAULT_MAIL_PASSWORD = process.env.MAIL_DEFAULT_PASSWORD || "Palmaris@2026";

/**
 * Monta a assinatura HTML corporativa da Palmaris com o logotipo oficial.
 */
function buildPalmarisSignature(userName: string, userEmail: string): string {
  return `
<br><br>
<div style="font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #334155; border-top: 2px solid #0066f5; padding-top: 14px; margin-top: 24px;">
  <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
    <tr>
      <td style="padding-right: 18px; vertical-align: middle;">
        <img src="https://palmaris.com.br/img/logo-palmaris.jpg" alt="Palmaris Representações" width="135" style="display: block; border-radius: 4px; max-width: 135px; height: auto;" />
      </td>
      <td style="vertical-align: middle; border-left: 2px solid #e2e8f0; padding-left: 18px; line-height: 1.5;">
        <div style="font-size: 14px; font-weight: bold; color: #0f172a;">${userName}</div>
        <div style="font-size: 12px; font-weight: bold; color: #0066f5;">Palmaris Representações</div>
        <div style="font-size: 11px; color: #64748b;">Conectamos indústria, tecnologia e soluções.</div>
        <div style="font-size: 12px; color: #334155; margin-top: 4px;">
          📞 (21) 99876-5432 &nbsp;|&nbsp; ✉️ <a href="mailto:${userEmail}" style="color: #0066f5; text-decoration: none;">${userEmail}</a>
        </div>
        <div style="font-size: 11px; margin-top: 2px;">
          🌐 <a href="https://palmaris.com.br" target="_blank" style="color: #0066f5; text-decoration: none; font-weight: 600;">www.palmaris.com.br</a>
        </div>
      </td>
    </tr>
  </table>
</div>
  `;
}

/** Envia um e-mail individual com a assinatura corporativa da Palmaris */
export async function sendEmailAction(
  _prev: { error?: string; success?: string } | null,
  formData: FormData,
): Promise<{ error?: string; success?: string }> {
  const user = await requireAuth();

  const toRaw = String(formData.get("to") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const bodyText = String(formData.get("body") ?? "").trim();
  const includeSignature = formData.get("includeSignature") !== "off";

  if (!toRaw) {
    return { error: "Informe ao menos um destinatário." };
  }
  if (!subject) {
    return { error: "Informe o assunto da mensagem." };
  }
  if (!bodyText) {
    return { error: "Escreva o conteúdo da mensagem." };
  }

  const toList = toRaw
    .split(/[,;\n]/)
    .map((e) => e.trim())
    .filter((e) => e.includes("@"));

  if (toList.length === 0) {
    return { error: "Nenhum endereço de e-mail válido foi encontrado." };
  }

  // Formata o corpo com parágrafos e quebras de linha
  const formattedHtml = bodyText
    .split("\n\n")
    .map((p) => `<p style="margin: 0 0 12px 0; line-height: 1.6; color: #1e293b;">${p.replace(/\n/g, "<br>")}</p>`)
    .join("");

  const signatureHtml = includeSignature
    ? buildPalmarisSignature(user.name || "Equipe Palmaris", user.email)
    : "";

  const finalHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #1e293b; margin: 0; padding: 10px;">
  ${formattedHtml}
  ${signatureHtml}
</body>
</html>
  `;

  // Upload dos anexos (se houver)
  const uploadedAttachments: Array<{ blobId: string; name: string; type: string; size: number }> = [];
  const files = formData.getAll("attachments") as File[];
  for (const file of files) {
    if (file.size === 0) continue;
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const blobId = await uploadBlob(user.email, DEFAULT_MAIL_PASSWORD, buffer, file.type || "application/octet-stream");
      uploadedAttachments.push({
        blobId,
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
      });
    } catch (err: any) {
      return { error: `Erro ao enviar anexo "${file.name}": ${err.message}` };
    }
  }

  try {
    await sendJmapEmail({
      user: user.email,
      pass: DEFAULT_MAIL_PASSWORD,
      to: toList,
      subject,
      html: finalHtml,
      text: bodyText,
      attachments: uploadedAttachments,
    });

    revalidatePath("/admin/email");
    return { success: "E-mail enviado com sucesso!" };
  } catch (err: any) {
    return { error: err.message || "Erro ao enviar e-mail pelo servidor." };
  }
}

/** Envio em lote / campanha de e-mails com intervalo de segurança */
export async function sendCampaignAction(
  _prev: { error?: string; success?: string; sentCount?: number } | null,
  formData: FormData,
): Promise<{ error?: string; success?: string; sentCount?: number }> {
  const user = await requireAuth();

  if (user.role !== "ADMIN" && !user.owner) {
    return { error: "Apenas administradores podem disparar campanhas." };
  }

  const fromEmail = String(formData.get("fromEmail") ?? user.email).trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const bodyText = String(formData.get("body") ?? "").trim();
  const recipientsRaw = String(formData.get("recipients") ?? "").trim();
  const delaySec = Math.max(1, Math.min(10, Number(formData.get("delay") ?? 2)));

  const recipients = recipientsRaw
    .split(/[\n,;]/)
    .map((r) => r.trim())
    .filter((r) => r.includes("@") && r.includes("."));

  if (recipients.length === 0) {
    return { error: "Informe ao menos um destinatário válido na lista." };
  }
  if (!subject) {
    return { error: "Informe o assunto da campanha." };
  }
  if (!bodyText) {
    return { error: "Escreva o texto do e-mail da campanha." };
  }

  const signatureHtml = buildPalmarisSignature(
    fromEmail.includes("comercial") ? "Departamento Comercial" : "Palmaris Representações",
    fromEmail,
  );

  const formattedHtml = bodyText
    .split("\n\n")
    .map((p) => `<p style="margin: 0 0 12px 0; line-height: 1.6; color: #1e293b;">${p.replace(/\n/g, "<br>")}</p>`)
    .join("");

  const finalHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #1e293b; margin: 0; padding: 10px;">
  ${formattedHtml}
  ${signatureHtml}
  <div style="margin-top: 30px; border-top: 1px solid #cbd5e1; padding-top: 10px; font-size: 11px; color: #94a3b8; text-align: center;">
    Você recebeu esta mensagem porque mantém contato com a Palmaris Representações.<br>
    Caso não deseje mais receber comunicações, responda este e-mail com o assunto "Descadastrar".
  </div>
</body>
</html>
  `;

  let sent = 0;
  // Dispara com intervalo controlado para proteger a reputação do IP da VPS
  for (const recipient of recipients) {
    try {
      await sendJmapEmail({
        user: fromEmail,
        pass: DEFAULT_MAIL_PASSWORD,
        to: [recipient],
        subject,
        html: finalHtml,
        text: bodyText,
      });
      sent++;
      if (delaySec > 0 && sent < recipients.length) {
        await new Promise((resolve) => setTimeout(resolve, delaySec * 1000));
      }
    } catch {
      // continua para os próximos
    }
  }

  return {
    success: `Campanha disparada com sucesso! ${sent} de ${recipients.length} e-mails enviados.`,
    sentCount: sent,
  };
}
