import { ImapFlow } from "imapflow";
import nodemailer from "nodemailer";

const IMAP_HOST = process.env.IMAP_HOST || "172.24.0.2";
const IMAP_PORT = parseInt(process.env.IMAP_PORT || "993");
const SMTP_HOST = process.env.SMTP_HOST || "172.24.0.2";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");

export type MailboxItem = {
  id: string;
  name: string;
  role: "inbox" | "sent" | "drafts" | "trash" | "junk" | string;
  totalEmails: number;
  unreadEmails: number;
};

export type EmailAttachment = {
  blobId: string;
  name: string;
  type: string;
  size: number;
  cid?: string;
  disposition?: string;
};

export type EmailSummary = {
  id: string;
  threadId: string;
  subject: string;
  from: Array<{ name: string; email: string }>;
  to: Array<{ name: string; email: string }>;
  receivedAt: string;
  sentAt?: string;
  preview: string;
  hasAttachment?: boolean;
  size: number;
  isUnread: boolean;
};

export type EmailDetail = EmailSummary & {
  htmlBody: string;
  textBody: string;
  attachments: EmailAttachment[];
};

function createImapClient(user: string, pass: string): ImapFlow {
  return new ImapFlow({
    host: IMAP_HOST,
    port: IMAP_PORT,
    secure: IMAP_PORT === 993,
    auth: { user, pass },
    logger: false,
    tls: { rejectUnauthorized: false },
  });
}

const ROLE_MAP: Record<string, string> = {
  INBOX: "inbox",
  Sent: "sent",
  Drafts: "drafts",
  Trash: "trash",
  Junk: "junk",
  "Sent Messages": "sent",
  "Deleted Messages": "trash",
  "Junk Email": "junk",
};

function getRole(name: string): string {
  return ROLE_MAP[name] || "custom";
}

export async function listMailboxes(user: string, pass: string): Promise<MailboxItem[]> {
  console.error("LISTMAILBOXES called with user:", user, "host:", process.env.IMAP_HOST, "port:", process.env.IMAP_PORT);
  const client = createImapClient(user, pass);
  try {
    await client.connect();
    console.error("IMAP CONNECTED");
  } catch (err: any) {
    console.error("IMAP CONNECT ERROR:", err?.message, err?.stack);
    throw new Error(`IMAP connect failed: ${err?.message || err}`);
  }

  const mailboxes = await client.list();
  console.error("IMAP LIST returned", mailboxes.length, "mailboxes");
  const result: MailboxItem[] = [];

  for (const box of mailboxes) {
    try {
      const status = await client.status(box.path, { messages: true, unseen: true });
      result.push({
        id: box.path,
        name: box.name,
        role: getRole(box.name),
        totalEmails: (status as any).messages || 0,
        unreadEmails: (status as any).unseen || 0,
      });
    } catch (err: any) {
      console.error("STATUS ERROR for", box.path, ":", err?.message);
      result.push({
        id: box.path,
        name: box.name,
        role: getRole(box.name),
        totalEmails: 0,
        unreadEmails: 0,
      });
    }
  }

  await client.logout();
  return result;
}

export async function listEmails(
  user: string,
  pass: string,
  mailboxId?: string,
  limit = 40,
): Promise<EmailSummary[]> {
  const client = createImapClient(user, pass);
  await client.connect();

  const box = mailboxId || "INBOX";
  const lock = await client.getMailboxLock(box);

  try {
    const messages = await client.search({ all: true }, { uid: true });
    const uids = (messages || []).slice(-limit).reverse();

    const emails: EmailSummary[] = [];

    for (const uid of uids) {
      const msg = await client.fetchOne(uid, {
        envelope: true,
        flags: true,
        size: true,
        bodyStructure: true,
      }, { uid: true });

      if (!msg) continue;

      const envelope = msg.envelope;
      const flags = msg.flags || new Set();

      emails.push({
        id: String(msg.uid),
        threadId: String(msg.uid),
        subject: envelope?.subject || "(Sem assunto)",
        from: (envelope?.from || []).map((a: any) => ({ name: a.name || "", email: a.address || "" })),
        to: (envelope?.to || []).map((a: any) => ({ name: a.name || "", email: a.address || "" })),
        receivedAt: envelope?.date ? new Date(envelope.date).toISOString() : new Date().toISOString() || new Date().toISOString(),
        preview: "",
        hasAttachment: hasAttachments(msg.bodyStructure),
        size: msg.size || 0,
        isUnread: !flags.has("\\Seen"),
      });
    }

    return emails;
  } finally {
    lock.release();
    await client.logout();
  }
}

function hasAttachments(bs: any): boolean {
  if (!bs) return false;
  if (bs.disposition === "attachment") return true;
  if (bs.childNodes) {
    return bs.childNodes.some((c: any) => hasAttachments(c));
  }
  return false;
}

export async function getEmailDetail(
  user: string,
  pass: string,
  emailId: string,
  mailbox?: string,
): Promise<EmailDetail | null> {
  const client = createImapClient(user, pass);
  await client.connect();

  const box = mailbox || "INBOX";
  const lock = await client.getMailboxLock(box);
  try {
    const uid = parseInt(emailId);
    const msg = await client.fetchOne(uid, {
      envelope: true,
      flags: true,
      size: true,
      bodyStructure: true,
    }, { uid: true });

    if (!msg) return null;

    const envelope = msg.envelope;
    const flags = msg.flags || new Set();

    let htmlBody = "";
    let textBody = "";
    const attachments: EmailAttachment[] = [];

    // Usa client.download() para decodificar corretamente quoted-printable/base64
    try {
      const download = await client.download(String(uid), undefined, { uid: true });
      if (download && download.content) {
        const content = download.content;
        const meta = download.meta || {};
        const disposition = meta.disposition || "";
        const contentType = meta.contentType || "";
        const filename = meta.filename;

        if (filename && disposition === "attachment") {
          const chunks: Buffer[] = [];
          for await (const chunk of content) chunks.push(Buffer.from(chunk));
          attachments.push({
            blobId: "",
            name: filename,
            type: contentType,
            size: (meta as any).size || 0,
            disposition,
          });
        } else if (/text\/html/i.test(contentType)) {
          const chunks: Buffer[] = [];
          for await (const chunk of content) chunks.push(Buffer.from(chunk));
          htmlBody = fixMojibake(Buffer.concat(chunks).toString("utf8"));
        } else if (/text\/plain/i.test(contentType)) {
          const chunks: Buffer[] = [];
          for await (const chunk of content) chunks.push(Buffer.from(chunk));
          textBody = fixMojibake(Buffer.concat(chunks).toString("utf8"));
        }
      }
    } catch (err: any) {
      console.error("Erro ao baixar corpo:", err?.message);
    }

    // Se não conseguiu via download, tenta source bruto
    if (!htmlBody && !textBody) {
      try {
        const full = await client.fetchOne(uid, { source: true }, { uid: true });
        if (full && full.source) {
          const source = full.source.toString();
          const htmlMatch = source.match(/Content-Type: text\/html[\s\S]*?\r\n\r\n([\s\S]*?)(?=\r\n--|$)/i);
          const textMatch = source.match(/Content-Type: text\/plain[\s\S]*?\r\n\r\n([\s\S]*?)(?=\r\n--|$)/i);
          if (htmlMatch) htmlBody = fixMojibake(decodeQP(htmlMatch[1]));
          if (textMatch) textBody = fixMojibake(decodeQP(textMatch[1]));
        }
      } catch {}
    }

    return {
      id: String(msg.uid),
      threadId: String(msg.uid),
      subject: envelope?.subject || "(Sem assunto)",
      from: (envelope?.from || []).map((a: any) => ({ name: a.name || "", email: a.address || "" })),
      to: (envelope?.to || []).map((a: any) => ({ name: a.name || "", email: a.address || "" })),
      receivedAt: envelope?.date ? new Date(envelope.date).toISOString() : new Date().toISOString(),
      preview: "",
      hasAttachment: hasAttachments(msg.bodyStructure),
      size: msg.size || 0,
      isUnread: !flags.has("\\Seen"),
      htmlBody: htmlBody || textBody || "",
      textBody: textBody || "",
      attachments,
    };
  } finally {
    lock.release();
    await client.logout();
  }
}

function fixMojibake(input: string): string {
  if (!input) return input;
  // Corrige dupla codificação UTF-8 (ex: "Ã³timo" -> "ótimo", "Ã§" -> "ç")
  if (/[ÃÂ][\u0080-\u00BF\u00A0-\u00FF]/.test(input)) {
    try {
      const fixed = Buffer.from(input, "latin1").toString("utf8");
      if (!fixed.includes("\uFFFD") && !/[ÃÂ][\u0080-\u00BF]/.test(fixed)) {
        return fixed;
      }
    } catch {}
  }
  return input;
}

function decodeQP(input: string): string {
  try {
    const qp = require("quoted-printable");
    return qp.decode(input.replace(/=\r?\n/g, ""));
  } catch {
    return input
      .replace(/=\r?\n/g, "")
      .replace(/=([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  }
}

export async function sendImapEmail({
  user,
  pass,
  to,
  subject,
  html,
  text,
  attachments,
}: {
  user: string;
  pass: string;
  to: string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{ path?: string; filename?: string; content?: Buffer; contentType?: string }>;
}) {
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });

  const mailAttachments = (attachments || []).map((att) => ({
    filename: att.filename,
    content: att.content,
    contentType: att.contentType,
  }));

  const info = await transporter.sendMail({
    from: user,
    to: to.join(", "),
    subject,
    html,
    text: text || "",
    attachments: mailAttachments,
  });

  // Salvar o email enviado na pasta "Sent" via IMAP
  try {
    const boundary = "----=_Part_" + Date.now();
    const fromName = user.split("@")[0];
    let mime = "";
    mime += `From: =?UTF-8?B?${Buffer.from(fromName).toString("base64")}?= <${user}>\r\n`;
    mime += `To: ${to.join(", ")}\r\n`;
    mime += `Subject: =?UTF-8?B?${Buffer.from(subject).toString("base64")}?=\r\n`;
    mime += `Date: ${new Date().toUTCString()}\r\n`;
    mime += `MIME-Version: 1.0\r\n`;

    if (mailAttachments.length > 0) {
      mime += `Content-Type: multipart/mixed; boundary="${boundary}"\r\n\r\n`;
      mime += `--${boundary}\r\n`;
      mime += `Content-Type: text/html; charset=UTF-8\r\n`;
      mime += `Content-Transfer-Encoding: 8bit\r\n\r\n`;
      mime += `${html}\r\n`;
      for (const att of mailAttachments) {
        if (att.content) {
          mime += `--${boundary}\r\n`;
          mime += `Content-Type: ${att.contentType || "application/octet-stream"}\r\n`;
          mime += `Content-Transfer-Encoding: base64\r\n`;
          mime += `Content-Disposition: attachment; filename="${att.filename}"\r\n\r\n`;
          mime += att.content.toString("base64") + "\r\n";
        }
      }
      mime += `--${boundary}--\r\n`;
    } else {
      mime += `Content-Type: text/html; charset=UTF-8\r\n`;
      mime += `Content-Transfer-Encoding: 8bit\r\n\r\n`;
      mime += `${html}\r\n`;
    }

    const mimeMessage = Buffer.from(mime, "utf8");

    const imapClient = createImapClient(user, pass);
    await imapClient.connect();
    const boxes = await imapClient.list();
    const sentBox = boxes.find(
      (b) => /\/Sent$/i.test(b.path) || /^Sent$/i.test(b.name) || /sent|enviad/i.test(b.name),
    );
    if (sentBox) {
      await imapClient.append(sentBox.path, mimeMessage, ["\\Seen"]);
    }
    await imapClient.logout();
  } catch (err: any) {
    console.error("Erro ao salvar no Sent:", err?.message);
  }

  return info;
}

export async function uploadBlob(
  user: string,
  pass: string,
  file: Buffer,
  mimeType: string,
): Promise<string> {
  // For IMAP, we don't upload blobs - we store them in memory
  // Return a base64-encoded identifier
  return Buffer.from(file).toString("base64").slice(0, 32);
}

export function getAttachmentDownloadUrl(accountId: string, blobId: string, name: string): string {
  return `/admin/email/download?blobId=${blobId}&name=${encodeURIComponent(name)}&accountId=${accountId}`;
}

/** Move uma mensagem para a pasta Lixeira (Trash) ou a exclui permanentemente */
export async function deleteEmail(
  user: string,
  pass: string,
  emailId: string,
  mailbox?: string,
): Promise<void> {
  const client = createImapClient(user, pass);
  await client.connect();

  const box = mailbox || "INBOX";
  const lock = await client.getMailboxLock(box);
  try {
    const uid = parseInt(emailId);
    const boxes = await client.list();
    const trashBox = boxes.find(
      (b) => getRole(b.name) === "trash" || /trash|lixeira|delet/i.test(b.name),
    );

    if (trashBox && trashBox.path !== box) {
      await client.messageMove(String(uid), trashBox.path, { uid: true });
    } else {
      await client.messageDelete(String(uid), { uid: true });
      await client.noop();
    }
  } finally {
    lock.release();
    await client.logout();
  }
}
