/**
 * Biblioteca de integração JMAP (JSON Mail Access Protocol) com o servidor Stalwart.
 * Permite listar caixas postais, ler e-mails em tempo real, enviar mensagens com anexos
 * e baixar anexos recebidos.
 */

const JMAP_URL = process.env.STALWART_JMAP_URL || "https://mail.palmaris.com.br/jmap/";
const WELL_KNOWN_URL = process.env.STALWART_WELL_KNOWN_URL || "https://mail.palmaris.com.br/.well-known/jmap";

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

function getAuthHeader(user: string, pass: string): string {
  const token = Buffer.from(`${user}:${pass}`).toString("base64");
  return `Basic ${token}`;
}

export async function getJmapSession(user: string, pass: string) {
  const res = await fetch(WELL_KNOWN_URL, {
    headers: { Authorization: getAuthHeader(user, pass) },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Falha na autenticação do e-mail (${res.status})`);
  }

  const data = await res.json();
  const accountId = data.primaryAccounts?.["urn:ietf:params:jmap:mail"];
  const submissionAccountId = data.primaryAccounts?.["urn:ietf:params:jmap:submission"];

  return {
    accountId,
    submissionAccountId,
    apiUrl: data.apiUrl || JMAP_URL,
    username: data.username,
  };
}

async function callJmap(user: string, pass: string, payload: unknown) {
  const auth = getAuthHeader(user, pass);
  const res = await fetch(JMAP_URL, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Erro na chamada JMAP (${res.status}): ${errText}`);
  }

  return res.json();
}

export async function listMailboxes(user: string, pass: string): Promise<MailboxItem[]> {
  const { accountId } = await getJmapSession(user, pass);

  const payload = {
    using: ["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:mail"],
    methodCalls: [["Mailbox/get", { accountId }, "call_mailbox"]],
  };

  const data = await callJmap(user, pass, payload);
  const list = data?.methodResponses?.[0]?.[1]?.list || [];

  return list.map((box: any) => ({
    id: box.id,
    name: box.name,
    role: box.role || "custom",
    totalEmails: box.totalEmails || 0,
    unreadEmails: box.unreadEmails || 0,
  }));
}

export async function listEmails(
  user: string,
  pass: string,
  mailboxId?: string,
  limit = 40,
): Promise<EmailSummary[]> {
  const { accountId } = await getJmapSession(user, pass);

  const filter = mailboxId ? { inMailbox: mailboxId } : {};

  const payload = {
    using: ["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:mail"],
    methodCalls: [
      ["Email/query", { accountId, filter, sort: [{ property: "receivedAt", isAscending: false }], limit }, "query_emails"],
      ["Email/get", { accountId, "#ids": { resultOf: "query_emails", name: "Email/query", path: "/ids" }, properties: ["id", "threadId", "subject", "from", "to", "receivedAt", "sentAt", "preview", "hasAttachment", "keywords", "size"] }, "get_emails"],
    ],
  };

  const data = await callJmap(user, pass, payload);
  const emails = data?.methodResponses?.[1]?.[1]?.list || [];

  return emails.map((m: any) => ({
    id: m.id,
    threadId: m.threadId,
    subject: m.subject || "(Sem assunto)",
    from: m.from || [],
    to: m.to || [],
    receivedAt: m.receivedAt,
    sentAt: m.sentAt,
    preview: m.preview || "",
    hasAttachment: Boolean(m.hasAttachment),
    size: m.size || 0,
    isUnread: !(m.keywords && m.keywords["$seen"]),
  }));
}

export async function getEmailDetail(
  user: string,
  pass: string,
  emailId: string,
): Promise<EmailDetail | null> {
  const { accountId } = await getJmapSession(user, pass);

  const payload = {
    using: ["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:mail"],
    methodCalls: [
      [
        "Email/get",
        {
          accountId,
          ids: [emailId],
          fetchAllBodyValues: true,
          properties: ["id", "threadId", "subject", "from", "to", "cc", "receivedAt", "sentAt", "preview", "hasAttachment", "keywords", "size", "htmlBody", "textBody", "bodyValues", "attachments"],
        },
        "get_email",
      ],
    ],
  };

  const data = await callJmap(user, pass, payload);
  const email = data?.methodResponses?.[0]?.[1]?.list?.[0];

  if (!email) return null;

  let htmlBody = "";
  let textBody = "";

  if (email.htmlBody && email.htmlBody.length > 0) {
    const partId = email.htmlBody[0]?.partId;
    if (partId && email.bodyValues?.[partId]) {
      htmlBody = email.bodyValues[partId].value;
    }
  }

  if (email.textBody && email.textBody.length > 0) {
    const partId = email.textBody[0]?.partId;
    if (partId && email.bodyValues?.[partId]) {
      textBody = email.bodyValues[partId].value;
    }
  }

  const attachments: EmailAttachment[] = (email.attachments || []).map((att: any) => ({
    blobId: att.blobId,
    name: att.name || "arquivo",
    type: att.type || "application/octet-stream",
    size: att.size || 0,
    cid: att.cid,
    disposition: att.disposition,
  }));

  return {
    id: email.id,
    threadId: email.threadId,
    subject: email.subject || "(Sem assunto)",
    from: email.from || [],
    to: email.to || [],
    receivedAt: email.receivedAt,
    sentAt: email.sentAt,
    preview: email.preview || "",
    hasAttachment: Boolean(email.hasAttachment) || attachments.length > 0,
    size: email.size || 0,
    isUnread: !(email.keywords && email.keywords["$seen"]),
    htmlBody: htmlBody || textBody || "",
    textBody: textBody || email.preview || "",
    attachments,
  };
}

export async function uploadBlob(
  user: string,
  pass: string,
  file: Buffer,
  mimeType: string,
): Promise<string> {
  const { accountId } = await getJmapSession(user, pass);
  const auth = getAuthHeader(user, pass);

  const res = await fetch(`${JMAP_URL}upload/${accountId}/`, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": mimeType },
    body: file as any,
  });

  if (!res.ok) {
    throw new Error(`Falha no upload do anexo (${res.status})`);
  }

  const data = await res.json();
  return data.blobId;
}

export async function sendJmapEmail({
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
  attachments?: Array<{ blobId: string; name: string; type: string; size: number }>;
}) {
  const { accountId } = await getJmapSession(user, pass);

  const prepPayload = {
    using: ["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:mail", "urn:ietf:params:jmap:submission"],
    methodCalls: [
      ["Identity/get", { accountId }, "get_identity"],
      ["Mailbox/get", { accountId }, "get_mailbox"],
    ],
  };

  const prepRes = await callJmap(user, pass, prepPayload);
  const identities = prepRes?.methodResponses?.[0]?.[1]?.list || [];
  const mailboxes = prepRes?.methodResponses?.[1]?.[1]?.list || [];

  const identity = identities[0];
  const identityId = identity?.id || "b";
  const fromName = identity?.name || user;

  const sentBox = mailboxes.find((b: any) => b.role === "sent") || mailboxes[0];
  const sentBoxId = sentBox?.id || "e";

  const toRecipients = to.map((addr) => ({ name: "", email: addr.trim() }));
  const now = new Date().toISOString();

  const emailAttachments = (attachments || []).map((att) => ({
    blobId: att.blobId,
    name: att.name,
    type: att.type,
    size: att.size,
    disposition: "attachment",
  }));

  const sendPayload = {
    using: ["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:mail", "urn:ietf:params:jmap:submission"],
    methodCalls: [
      [
        "Email/set",
        {
          accountId,
          create: {
            msg1: {
              mailboxIds: { [sentBoxId]: true },
              keywords: { $seen: true },
              from: [{ name: fromName, email: user }],
              to: toRecipients,
              subject,
              sentAt: now,
              bodyValues: { part1: { value: html } },
              htmlBody: [{ partId: "part1", type: "text/html" }],
              attachments: emailAttachments,
            },
          },
        },
        "create_msg",
      ],
      [
        "EmailSubmission/set",
        {
          accountId,
          create: {
            sub1: {
              emailId: "#msg1",
              identityId,
              envelope: {
                mailFrom: { email: user },
                rcptTo: to.map((addr) => ({ email: addr.trim() })),
              },
            },
          },
        },
        "submit_msg",
      ],
    ],
  };

  const result = await callJmap(user, pass, sendPayload);
  return result;
}

export function getAttachmentDownloadUrl(accountId: string, blobId: string, name: string): string {
  return `/admin/email/download?blobId=${blobId}&name=${encodeURIComponent(name)}&accountId=${accountId}`;
}
