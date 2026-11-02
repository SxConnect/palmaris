import { requireAuth } from "@/lib/auth/guard";
import { listMailboxes, listEmails, getEmailDetail } from "@/lib/jmap";
import WebmailClient from "./WebmailClient";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ box?: string; id?: string }>;
};

const DEFAULT_MAIL_PASSWORD = process.env.MAIL_DEFAULT_PASSWORD || "Palmaris@2026";

export default async function WebmailPage({ searchParams }: Props) {
  const user = await requireAuth();
  const params = await searchParams;

  let mailboxes: any[] = [];
  let emails: any[] = [];
  let selectedEmail: any = null;
  let currentBoxId = "";

  try {
    mailboxes = await listMailboxes(user.email, DEFAULT_MAIL_PASSWORD);
    const inbox = mailboxes.find((b) => b.role === "inbox") || mailboxes[0];
    currentBoxId = params.box || inbox?.id || "";

    if (currentBoxId) {
      emails = await listEmails(user.email, DEFAULT_MAIL_PASSWORD, currentBoxId);
    }

    if (params.id) {
      selectedEmail = await getEmailDetail(user.email, DEFAULT_MAIL_PASSWORD, params.id);
    }
  } catch (err: any) {
    console.error("Erro ao carregar dados do Webmail JMAP:", err);
  }

  return (
    <WebmailClient
      currentUser={{
        email: user.email,
        name: user.name,
        owner: Boolean(user.owner),
      }}
      mailboxes={mailboxes}
      emails={emails}
      selectedEmail={selectedEmail}
      currentMailboxId={currentBoxId}
    />
  );
}
