import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendJmapEmail } from "@/lib/jmap";

const DEFAULT_MAIL_PASSWORD = process.env.MAIL_DEFAULT_PASSWORD || "Palmaris@2026";
const CRON_SECRET = process.env.CRON_SECRET || "palmaris-cron-secret-2026";

function buildSignature(fromEmail: string): string {
  const name = fromEmail.includes("comercial")
    ? "Departamento Comercial"
    : "Palmaris Representações";
  return `
<br><br>
<div style="font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #334155; border-top: 2px solid #0066f5; padding-top: 14px; margin-top: 24px;">
  <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
    <tr>
      <td style="padding-right: 18px; vertical-align: middle;">
        <img src="https://palmaris.com.br/img/logo-palmaris.jpg" alt="Palmaris Representações" width="135" style="display: block; border-radius: 4px; max-width: 135px; height: auto;" />
      </td>
      <td style="vertical-align: middle; border-left: 2px solid #e2e8f0; padding-left: 18px; line-height: 1.5;">
        <div style="font-size: 14px; font-weight: bold; color: #0f172a;">${name}</div>
        <div style="font-size: 12px; font-weight: bold; color: #0066f5;">Palmaris Representações</div>
        <div style="font-size: 11px; color: #64748b;">Conectamos indústria, tecnologia e soluções.</div>
        <div style="font-size: 12px; color: #334155; margin-top: 4px;">
          📞 (21) 99876-5432 &nbsp;|&nbsp; ✉️ <a href="mailto:${fromEmail}" style="color: #0066f5; text-decoration: none;">${fromEmail}</a>
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

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find pending campaigns that are scheduled for now or earlier
    const now = new Date();
    const pendingCampaigns = await prisma.scheduledCampaign.findMany({
      where: {
        status: "pending",
        OR: [
          { scheduledAt: null },
          { scheduledAt: { lte: now } },
        ],
      },
      orderBy: { createdAt: "asc" },
    });

    if (pendingCampaigns.length === 0) {
      return NextResponse.json({ message: "No pending campaigns" });
    }

    const results = [];

    for (const campaign of pendingCampaigns) {
      // Mark as sending
      await prisma.scheduledCampaign.update({
        where: { id: campaign.id },
        data: { status: "sending", startedAt: new Date() },
      });

      const allRecipients = JSON.parse(campaign.recipients) as string[];
      const signatureHtml = buildSignature(campaign.fromEmail);

      const formattedHtml = campaign.body
        .split("\n\n")
        .map((p) => `<p style="margin: 0 0 12px 0; line-height: 1.6; color: #1e293b;">${p.replace(/\n/g, "<br>")}</p>`)
        .join("");

      // Determine batch size for warm-up
      let batchSize = 0;
      if (campaign.warmUp && campaign.batchSize > 0) {
        // Calculate how many have been sent already
        const alreadySent = campaign.sentCount;
        const remaining = allRecipients.length - alreadySent;
        // Increase batch size each day (batchSize, batchSize*2, batchSize*3, ...)
        const dayNumber = Math.floor(alreadySent / campaign.batchSize) + 1;
        batchSize = Math.min(campaign.batchSize * dayNumber, remaining);
        if (batchSize <= 0) batchSize = Math.min(campaign.batchSize, remaining);
      }

      const recipients = batchSize > 0 ? allRecipients.slice(campaign.sentCount, campaign.sentCount + batchSize) : allRecipients.slice(campaign.sentCount);

      let sent = campaign.sentCount;
      let failed = 0;

      for (const recipient of recipients) {
        const trackingId = `trk_${campaign.id}_${recipient.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}`;
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
          await sendJmapEmail({
            user: campaign.fromEmail,
            pass: DEFAULT_MAIL_PASSWORD,
            to: [recipient],
            subject: campaign.subject,
            html: finalHtml,
            text: campaign.body,
          });

          try {
            await prisma.emailOpen.create({
              data: {
                trackingId,
                recipient,
                campaignId: campaign.id,
              },
            });
          } catch {
            // Ignorar erros de tracking
          }

          sent++;
          await prisma.scheduledCampaign.update({
            where: { id: campaign.id },
            data: { sentCount: sent },
          });
          if (campaign.delaySec > 0 && sent < campaign.totalCount) {
            await new Promise((resolve) => setTimeout(resolve, campaign.delaySec * 1000));
          }
        } catch {
          failed++;
        }
      }

      const totalSent = sent;
      const remaining = allRecipients.length - totalSent;

      if (campaign.warmUp && remaining > 0) {
        // Reschedule for next day
        const nextDay = new Date();
        nextDay.setDate(nextDay.getDate() + 1);
        nextDay.setHours(9, 0, 0, 0); // 9am next day

        await prisma.scheduledCampaign.update({
          where: { id: campaign.id },
          data: {
            status: "pending",
            scheduledAt: nextDay,
            sentCount: totalSent,
            errorMessage: `${totalSent} de ${allRecipients.length} enviados. Próximo lote amanhã às 9h.`,
          },
        });
      } else {
        await prisma.scheduledCampaign.update({
          where: { id: campaign.id },
          data: {
            status: failed === recipients.length && recipients.length > 0 ? "failed" : "sent",
            completedAt: new Date(),
            sentCount: totalSent,
            errorMessage: failed > 0 ? `${failed} de ${recipients.length} falharam` : null,
          },
        });
      }

      results.push({
        id: campaign.id,
        subject: campaign.subject,
        sent,
        failed,
        total: recipients.length,
      });
    }

    return NextResponse.json({ processed: results.length, results });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
