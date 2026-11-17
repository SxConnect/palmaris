import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

const CRON_SECRET = process.env.CRON_SECRET || "palmaris-cron-secret-2026";
const MAIL_PASSWORD = process.env.MAIL_DEFAULT_PASSWORD || "Palmaris@2026";
const SMTP_HOST = process.env.SMTP_HOST || "mailserver";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
const REPORT_EMAIL = process.env.REPORT_EMAIL || "contato@palmaris.com.br";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const agora = new Date();
    const limite = new Date(agora.getTime() - 24 * 60 * 60 * 1000);

    // Campanhas concluídas há pelo menos 24h e sem relatório
    const [concluidas, relatoriosExistentes] = await Promise.all([
      prisma.scheduledCampaign.findMany({
        where: {
          status: "sent",
          completedAt: { lte: limite },
        },
      }),
      prisma.campaignReport.findMany({ select: { campaignId: true } }),
    ]);
    const jaGerados = new Set(relatoriosExistentes.map((r) => r.campaignId));
    const campaigns = concluidas.filter((c) => !jaGerados.has(c.id));

    const results = [];

    for (const campaign of campaigns) {
      const recipients: string[] = JSON.parse(campaign.recipients || "[]");

      const [sends, opens, bounces] = await Promise.all([
        prisma.emailSend.findMany({
          where: { campaignId: campaign.id },
          select: { recipient: true, trackingId: true },
        }),
        prisma.emailOpen.findMany({
          select: { trackingId: true },
        }),
        prisma.emailBounce.findMany({
          select: { recipient: true },
        }),
      ]);

      const openTrackingIds = new Set(opens.map((o) => o.trackingId));
      const bounceEmails = new Set(bounces.map((b) => b.recipient.toLowerCase()));

      let totalOpened = 0;
      let totalBounced = 0;
      for (const send of sends) {
        if (openTrackingIds.has(send.trackingId)) totalOpened++;
        if (bounceEmails.has(send.recipient.toLowerCase())) totalBounced++;
      }

      const totalSent = sends.length || recipients.length;
      const totalDelivered = Math.max(0, totalSent - totalBounced);
      const notOpened = Math.max(0, totalDelivered - totalOpened);
      const openRate = totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0;

      const summary = `Campanha "${campaign.subject}": ${totalSent} e-mails enviados, ${totalDelivered} entregues, ${totalBounced} bounces, ${totalOpened} abertos (${openRate.toFixed(1)}% de abertura). ${notOpened} entregues mas não abertos.`;

      const report = await prisma.campaignReport.upsert({
        where: { campaignId: campaign.id },
        update: {
          subject: campaign.subject,
          totalSent,
          totalDelivered,
          totalOpened,
          totalBounced,
          notOpened,
          openRate,
          summary,
        },
        create: {
          campaignId: campaign.id,
          subject: campaign.subject,
          totalSent,
          totalDelivered,
          totalOpened,
          totalBounced,
          notOpened,
          openRate,
          summary,
        },
      });

      // Enviar email resumo
      try {
        const transporter = nodemailer.createTransport({
          host: SMTP_HOST,
          port: SMTP_PORT,
          secure: false,
          auth: { user: REPORT_EMAIL, pass: MAIL_PASSWORD },
          tls: { rejectUnauthorized: false },
        });
        await transporter.sendMail({
          from: REPORT_EMAIL,
          to: REPORT_EMAIL,
          subject: `📊 Relatório de Campanha — ${campaign.subject}`,
          text: summary,
          html: `<div style="font-family:Arial,sans-serif;font-size:14px;color:#1e293b;">
            <h2 style="color:#0066f5;">📊 Relatório de Campanha</h2>
            <p><strong>${campaign.subject}</strong></p>
            <ul>
              <li>Enviados: ${totalSent}</li>
              <li>Entregues: ${totalDelivered}</li>
              <li>Bounces: ${totalBounced}</li>
              <li>Abertos: ${totalOpened} (${openRate.toFixed(1)}%)</li>
              <li>Entregues mas não abertos: ${notOpened}</li>
            </ul>
            <p style="color:#64748b;font-size:12px;">Gerado automaticamente 24h após a conclusão.</p>
          </div>`,
        });
      } catch (err: any) {
        console.error("Erro ao enviar email de relatorio:", err?.message);
      }

      results.push({ id: report.id, subject: campaign.subject, totalSent, totalOpened, totalBounced });
    }

    return NextResponse.json({ generated: results.length, results });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
