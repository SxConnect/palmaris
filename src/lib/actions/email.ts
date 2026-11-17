"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { requireAuth, requireAdmin } from "@/lib/auth/guard";
import { sendImapEmail, uploadBlob, deleteEmail } from "@/lib/imap";
import { prisma } from "@/lib/prisma";

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
          📞 (21) 98864-4221 &nbsp;|&nbsp; ✉️ <a href="mailto:${userEmail}" style="color: #0066f5; text-decoration: none;">${userEmail}</a>
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
  const uploadedAttachments: Array<{ filename: string; content: Buffer; contentType: string }> = [];
  const files = formData.getAll("attachments") as File[];
  for (const file of files) {
    if (file.size === 0) continue;
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      uploadedAttachments.push({
        filename: file.name,
        content: buffer,
        contentType: file.type || "application/octet-stream",
      });
    } catch (err: any) {
      return { error: `Erro ao enviar anexo "${file.name}": ${err.message}` };
    }
  }

  try {
    await sendImapEmail({
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
  const campaignName = String(formData.get("campaignName") ?? "").trim();
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

  // Salva a campanha no banco ANTES de disparar, para não se perder
  const campaign = await prisma.scheduledCampaign.create({
    data: {
      name: campaignName || null,
      fromEmail,
      subject,
      body: bodyText,
      recipients: JSON.stringify(recipients),
      delaySec,
      batchSize: 0,
      warmUp: false,
      status: "sending",
      scheduledAt: null,
      startedAt: new Date(),
      totalCount: recipients.length,
      createdBy: user.email,
    },
  });

  let sent = 0;
  // Dispara com intervalo controlado para proteger a reputação do IP da VPS
  for (const recipient of recipients) {
    // Gerar tracking ID único para este destinatário
    const trackingId = `trk_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    const trackingPixel = `<img src="https://palmaris.com.br/api/track/open?id=${trackingId}" width="1" height="1" style="display:none;border:0;" alt="" />`;

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
  ${trackingPixel}
</body>
</html>
  `;

    try {
      await sendImapEmail({
        user: fromEmail,
        pass: DEFAULT_MAIL_PASSWORD,
        to: [recipient],
        subject,
        html: finalHtml,
        text: bodyText,
      });

      // Registrar o tracking no banco
      try {
        await prisma.emailSend.create({
          data: {
            trackingId,
            recipient,
            subject,
            campaignId: campaign.id,
          },
        });
      } catch {
        // Ignorar erros de tracking
      }

      sent++;
      if (delaySec > 0 && sent < recipients.length) {
        await new Promise((resolve) => setTimeout(resolve, delaySec * 1000));
      }
    } catch {
      // continua para os próximos
    }
  }

  await prisma.scheduledCampaign.update({
    where: { id: campaign.id },
    data: {
      status: sent > 0 ? "sent" : "failed",
      sentCount: sent,
      completedAt: new Date(),
    },
  });

  return {
    success: `Campanha disparada com sucesso! ${sent} de ${recipients.length} e-mails enviados.`,
    sentCount: sent,
  };
}

/** Agenda uma campanha de e-mail para envio futuro */
export async function scheduleCampaignAction(
  _prev: { error?: string; success?: string } | null,
  formData: FormData,
): Promise<{ error?: string; success?: string }> {
  const user = await requireAuth();

  if (user.role !== "ADMIN" && !user.owner) {
    return { error: "Apenas administradores podem agendar campanhas." };
  }

  const fromEmail = String(formData.get("fromEmail") ?? user.email).trim();
  const campaignName = String(formData.get("campaignName") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const bodyText = String(formData.get("body") ?? "").trim();
  const recipientsRaw = String(formData.get("recipients") ?? "").trim();
  const delaySec = Math.max(1, Math.min(10, Number(formData.get("delay") ?? 2)));
  const scheduledAtRaw = String(formData.get("scheduledAt") ?? "").trim();
  const warmUp = formData.get("warmUp") === "true";
  const batchSize = warmUp ? Math.max(10, Math.min(200, Number(formData.get("batchSize") ?? 50))) : 0;

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

  let scheduledAt: Date | null = null;
  if (scheduledAtRaw) {
    // datetime-local vem sem fuso (ex: 2026-11-17T10:00). O campo representa
    // horário de Brasília (UTC-3), então convertemos explicitamente para UTC.
    const hasTimezone = /Z|[+-]\d{2}:\d{2}$/.test(scheduledAtRaw);
    scheduledAt = hasTimezone
      ? new Date(scheduledAtRaw)
      : new Date(scheduledAtRaw + "-03:00");
    if (isNaN(scheduledAt.getTime())) {
      return { error: "Data/hora de agendamento inválida." };
    }
    if (scheduledAt.getTime() < Date.now()) {
      return { error: "A data de agendamento deve ser no futuro." };
    }
  }

  try {
    await prisma.scheduledCampaign.create({
      data: {
        name: campaignName || null,
        fromEmail,
        subject,
        body: bodyText,
        recipients: JSON.stringify(recipients),
        delaySec,
        batchSize,
        warmUp,
        status: "pending",
        scheduledAt,
        totalCount: recipients.length,
        createdBy: user.email,
      },
    });

    const when = scheduledAt
      ? `Agendada para ${scheduledAt.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}`
      : "Agendada para envio imediato (próximo ciclo do cron)";

    return { success: `${when}. ${recipients.length} destinatários na fila.` };
  } catch (err: any) {
    return { error: err.message || "Erro ao agendar campanha." };
  }
}


/** Exclui (move para a Lixeira) uma mensagem do webmail */
export async function deleteEmailAction(
  emailId: string,
  mailbox: string,
): Promise<{ success?: string; error?: string }> {
  const user = await requireAuth();

  if (!emailId) {
    return { error: "ID da mensagem ausente." };
  }

  try {
    await deleteEmail(user.email, DEFAULT_MAIL_PASSWORD, emailId, mailbox);
    revalidatePath("/admin/email");
    return { success: "Mensagem excluída." };
  } catch (err: any) {
    return { error: err.message || "Erro ao excluir a mensagem." };
  }
}

/** Lista as campanhas salvas no banco (mais recentes primeiro) */
export async function listCampaignsAction(): Promise<
  Array<{
    id: string;
    name: string | null;
    subject: string;
    fromEmail: string;
    body: string;
    recipientCount: number;
    status: string;
    scheduledAt: string | null;
    createdAt: string;
    sentCount: number;
  }>
> {
  await requireAdmin();
  const campaigns = await prisma.scheduledCampaign.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return campaigns.map((c) => ({
    id: c.id,
    name: c.name,
    subject: c.subject,
    fromEmail: c.fromEmail,
    body: c.body,
    recipientCount: Array.isArray(c.recipients)
      ? c.recipients.length
      : (() => { try { return JSON.parse(c.recipients).length; } catch { return 0; } })(),
    status: c.status,
    scheduledAt: c.scheduledAt ? c.scheduledAt.toISOString() : null,
    createdAt: c.createdAt.toISOString(),
    sentCount: c.sentCount,
  }));
}

export type RecipientStats = {
  recipient: string;
  timesSent: number;
  timesOpened: number;
  lastSentAt: string | null;
  lastOpenedAt: string | null;
  neverOpened: boolean;
};

/** Estatísticas por destinatário: quantas vezes foi enviado e quantas abriu */
export async function getRecipientStatsAction(): Promise<RecipientStats[]> {
  await requireAdmin();

  const [sends, opens] = await Promise.all([
    prisma.emailSend.findMany({
      orderBy: { sentAt: "desc" },
      select: { recipient: true, sentAt: true, trackingId: true },
    }),
    prisma.emailOpen.findMany({
      select: { recipient: true, trackingId: true, openedAt: true },
    }),
  ]);

  // Mapa de trackingId -> abertura
  const openByTracking = new Map(opens.map((o) => [o.trackingId, o]));
  const stats = new Map<string, RecipientStats>();

  for (const send of sends) {
    const key = send.recipient.toLowerCase();
    const existing = stats.get(key) || {
      recipient: send.recipient,
      timesSent: 0,
      timesOpened: 0,
      lastSentAt: null,
      lastOpenedAt: null,
      neverOpened: true,
    };
    existing.timesSent += 1;
    const opened = openByTracking.get(send.trackingId);
    if (opened) {
      existing.timesOpened += 1;
      if (!existing.lastOpenedAt || opened.openedAt > new Date(existing.lastOpenedAt)) {
        existing.lastOpenedAt = opened.openedAt.toISOString();
      }
    }
    if (!existing.lastSentAt) {
      existing.lastSentAt = send.sentAt.toISOString();
    }
    stats.set(key, existing);
  }

  const result = Array.from(stats.values());
  result.forEach((r) => {
    r.neverOpened = r.timesOpened === 0;
  });
  return result.sort((a, b) => b.timesSent - a.timesSent);
}

/** Retoma uma campanha pausada/falhada para continuar o envio no próximo ciclo do cron */
export async function resumeCampaignAction(
  id: string,
): Promise<{ success?: string; error?: string }> {
  await requireAdmin();

  try {
    const campaign = await prisma.scheduledCampaign.findUnique({ where: { id } });
    if (!campaign) return { error: "Campanha não encontrada." };

    await prisma.scheduledCampaign.update({
      where: { id },
      data: {
        status: "pending",
        scheduledAt: new Date(),
        errorMessage: null,
      },
    });
    revalidatePath("/admin/campanhas");
    return { success: "Campanha retomada. O cron vai continuar o envio em até 5 minutos." };
  } catch (err: any) {
    return { error: err.message || "Erro ao retomar campanha." };
  }
}
