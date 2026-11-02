import "server-only";

import nodemailer from "nodemailer";

/** Configuração do SMTP (opcional — sem ela o e-mail é apenas registrado no painel). */
function getTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  return {
    from: process.env.SMTP_FROM || user,
    transporter: nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    }),
  };
}

/** Envia o e-mail de recuperação de senha. */
export async function sendPasswordResetEmail(to: string, resetLink: string) {
  const config = getTransport();

  if (!config) {
    console.log(`[password-reset] link para ${to}: ${resetLink}`);
    return;
  }

  await config.transporter.sendMail({
    from: config.from,
    to,
    subject: "Redefinição de senha - ALMZO",
    html: `
      <p>Olá,</p>
      <p>Recebemos um pedido para redefinir sua senha. Clique no link abaixo:</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>Este link expira em 1 hora. Se você não solicitou, ignore este e-mail.</p>
    `,
  });
}

export type ContactEmail = {
  to: string;
  name: string;
  email: string;
  subject: string;
  message: string;
};

/**
 * Envia a mensagem do formulário de contato para o e-mail da associação.
 *
 * Devolve `false` quando o SMTP não está configurado — nesse caso a mensagem
 * continua salva no banco e aparece em /admin/mensagens.
 */
export async function sendContactEmail(data: ContactEmail): Promise<boolean> {
  const config = getTransport();

  if (!config) {
    console.log(`[contato] mensagem de ${data.email} (SMTP não configurado): ${data.message}`);
    return false;
  }

  const appUrl = process.env.APP_URL || "";
  const escape = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  await config.transporter.sendMail({
    from: config.from,
    to: data.to,
    replyTo: data.email,
    subject: `[Site ALMZO] ${data.subject}`,
    text: `${data.name} <${data.email}>\n\n${data.message}`,
    html: `
      <h2>Nova mensagem pelo site da ALMZO</h2>
      <p><strong>Nome:</strong> ${escape(data.name)}</p>
      <p><strong>E-mail:</strong> <a href="mailto:${escape(data.email)}">${escape(data.email)}</a></p>
      <p><strong>Assunto:</strong> ${escape(data.subject)}</p>
      <hr />
      <p style="white-space: pre-wrap">${escape(data.message)}</p>
      <hr />
      ${appUrl ? `<p><small>Enviado pelo site ${escape(appUrl)}</small></p>` : ""}
    `,
  });

  return true;
}
