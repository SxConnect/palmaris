import { ImapFlow } from "imapflow";
import nodemailer from "nodemailer";

const IMAP_HOST = process.env.IMAP_HOST || "mail.palmaris.com.br";
const IMAP_PORT = parseInt(process.env.IMAP_PORT || "993");
const SMTP_HOST = process.env.SMTP_HOST || "mail.palmaris.com.br";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "465");

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
  const client = createImapClient(user, pass);
  try {
    await client.connect();
  } catch (err: any) {
    console.error("IMAP CONNECT ERROR:", err?.message, err?.stack);
    throw new Error(`IMAP connect failed: ${err?.message || err}`);
  }

  const mailboxes = await client.list();
  const result: MailboxItem[] = [];

  for (const box of mailboxes) {
    const status = await client.status(box.path, { messages: true, unseen: true });
    result.push({
      id: box.path,
      name: box.name,
      role: getRole(box.name),
      totalEmails: (status as any).messages || 0,
      unreadEmails: (status as any).unseen || 0,
    });
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
): Promise<EmailDetail | null> {
  const client = createImapClient(user, pass);
  await client.connect();

  const lock = await client.getMailboxLock("INBOX");
  try {
    const uid = parseInt(emailId);
    const msg = await client.fetchOne(uid, {
      envelope: true,
      flags: true,
      size: true,
      bodyStructure: true,
      source: true,
    }, { uid: true });

    if (!msg) return null;

    const envelope = msg.envelope;
    const flags = msg.flags || new Set();

    // Parse body
    let htmlBody = "";
    let textBody = "";
    const attachments: EmailAttachment[] = [];

    if (msg.source) {
      const source = msg.source.toString();
      // Simple extraction - in production, use a proper MIME parser
      const htmlMatch = source.match(/Content-Type: text\/html[\s\S]*?\r\n\r\n([\s\S]*?)(?=\r\n--|\r\n\r\n$)/i);
      const textMatch = source.match(/Content-Type: text\/plain[\s\S]*?\r\n\r\n([\s\S]*?)(?=\r\n--|\r\n\r\n$)/i);

      if (htmlMatch) htmlBody = htmlMatch[1].trim();
      if (textMatch) textBody = textMatch[1].trim();
    }

    return {
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
      htmlBody: htmlBody || textBody || "",
      textBody: textBody || "",
      attachments,
    };
  } finally {
    lock.release();
    await client.logout();
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
    secure: SMTP_PORT === 465,
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
