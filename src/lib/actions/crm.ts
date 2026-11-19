"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/guard";

export type ClienteItem = {
  id: string;
  nome: string;
  empresa: string | null;
  cargo: string | null;
  telefone: string | null;
  email: string | null;
  emailExtra: string | null;
  indicadoPorId: string | null;
  indicadoPorNome: string | null;
  origem: string | null;
  tags: string | null;
  notas: string | null;
  responsavel: string | null;
  criadoEm: string;
  passosCount: number;
  passosFeitos: number;
  msgsCount: number;
};

export async function listClientesAction(): Promise<ClienteItem[]> {
  await requireAuth();
  const clientes = await prisma.cliente.findMany({
    orderBy: { atualizadoEm: "desc" },
    include: {
      indicadoPor: { select: { nome: true } },
      _count: { select: { passos: true, mensagens: true } },
    },
  });
  return clientes.map((c) => ({
    id: c.id,
    nome: c.nome,
    empresa: c.empresa,
    cargo: c.cargo,
    telefone: c.telefone,
    email: c.email,
    emailExtra: c.emailExtra,
    indicadoPorId: c.indicadoPorId,
    indicadoPorNome: c.indicadoPor?.nome || null,
    origem: c.origem,
    tags: c.tags,
    notas: c.notas,
    responsavel: c.responsavel,
    criadoEm: c.criadoEm.toISOString(),
    passosCount: c._count.passos,
    passosFeitos: 0,
    msgsCount: c._count.mensagens,
  }));
}

export async function getClienteAction(id: string) {
  await requireAuth();
  const c = await prisma.cliente.findUnique({
    where: { id },
    include: {
      indicadoPor: { select: { id: true, nome: true } },
      passos: { orderBy: { posicao: "asc" } },
      mensagens: { orderBy: { enviadoEm: "desc" }, take: 100 },
    },
  });
  if (!c) return null;
  // Emails deste cliente (por email principal ou extra)
  const emails = [c.email, c.emailExtra].filter(Boolean).map((e) => e!.toLowerCase());
  const [sends, bounces, recebidos] = await Promise.all([
    emails.length
      ? prisma.emailSend.findMany({
          where: { recipient: { in: emails } },
          orderBy: { sentAt: "desc" },
          take: 100,
        })
      : Promise.resolve([]),
    emails.length
      ? prisma.emailBounce.findMany({ where: { recipient: { in: emails } } })
      : Promise.resolve([]),
    emails.length
      ? prisma.emailRecebido.findMany({
          where: { de: { in: emails } },
          orderBy: { receivedAt: "desc" },
          take: 100,
        })
      : Promise.resolve([]),
  ]);
  const opens = await prisma.emailOpen.findMany({
    where: { trackingId: { in: sends.map((s) => s.trackingId) } },
    select: { trackingId: true, openedAt: true },
  });
  const openIds = new Set(opens.map((o) => o.trackingId));
  const bounceEmails = new Set(bounces.map((b) => b.recipient.toLowerCase()));
  return {
    id: c.id,
    nome: c.nome,
    empresa: c.empresa,
    cargo: c.cargo,
    telefone: c.telefone,
    email: c.email,
    emailExtra: c.emailExtra,
    indicadoPorId: c.indicadoPorId,
    indicadoPorNome: c.indicadoPor?.nome || null,
    origem: c.origem,
    tags: c.tags,
    notas: c.notas,
    responsavel: c.responsavel,
    criadoEm: c.criadoEm.toISOString(),
    passos: c.passos.map((p) => ({
      id: p.id,
      titulo: p.titulo,
      descricao: p.descricao,
      concluido: p.concluido,
      posicao: p.posicao,
      concluidoEm: p.concluidoEm ? p.concluidoEm.toISOString() : null,
    })),
    mensagens: c.mensagens.map((m) => ({
      id: m.id,
      jid: m.jid,
      direction: m.direction,
      texto: m.texto,
      mediaUrl: m.mediaUrl,
      mediaType: m.mediaType,
      enviadoEm: m.enviadoEm.toISOString(),
    })),
    emailsEnviados: sends.map((s) => ({
      id: s.id,
      recipient: s.recipient,
      subject: s.subject,
      sentAt: s.sentAt.toISOString(),
      opened: openIds.has(s.trackingId),
      bounced: bounceEmails.has(s.recipient.toLowerCase()),
    })),
    emailsRecebidos: recebidos.map((r) => ({
      id: r.id,
      de: r.de,
      deNome: r.deNome,
      subject: r.subject,
      preview: r.preview,
      receivedAt: r.receivedAt.toISOString(),
    })),
  };
}

export async function createClienteAction(data: {
  nome: string;
  empresa?: string;
  cargo?: string;
  telefone?: string;
  email?: string;
  emailExtra?: string;
  indicadoPorId?: string;
  origem?: string;
  tags?: string;
  notas?: string;
  responsavel?: string;
}) {
  const user = await requireAuth();
  const nome = (data.nome || "").trim();
  if (!nome) return { error: "Informe o nome." };

  const c = await prisma.cliente.create({
    data: {
      nome,
      empresa: data.empresa?.trim() || null,
      cargo: data.cargo?.trim() || null,
      telefone: data.telefone?.trim() || null,
      email: data.email?.trim().toLowerCase() || null,
      emailExtra: data.emailExtra?.trim().toLowerCase() || null,
      indicadoPorId: data.indicadoPorId || null,
      origem: data.origem?.trim() || null,
      tags: data.tags?.trim() || null,
      notas: data.notas?.trim() || null,
      responsavel: data.responsavel?.trim() || user.email,
    },
  });
  revalidatePath("/admin/clientes");
  return { success: "Cliente criado.", id: c.id };
}

export async function updateClienteAction(id: string, data: Record<string, string | null>) {
  await requireAuth();
  await prisma.cliente.update({
    where: { id },
    data: {
      ...data,
      email: data.email ? String(data.email).toLowerCase() : null,
      emailExtra: data.emailExtra ? String(data.emailExtra).toLowerCase() : null,
    },
  });
  revalidatePath("/admin/clientes");
  return { success: "Cliente atualizado." };
}

export async function deleteClienteAction(id: string) {
  await requireAuth();
  await prisma.cliente.delete({ where: { id } });
  revalidatePath("/admin/clientes");
  return { success: "Cliente removido." };
}

export async function addPassoAction(clienteId: string, titulo: string, descricao?: string) {
  await requireAuth();
  if (!titulo?.trim()) return { error: "Informe o título do passo." };
  const count = await prisma.clientePasso.count({ where: { clienteId } });
  await prisma.clientePasso.create({
    data: {
      clienteId,
      titulo: titulo.trim(),
      descricao: descricao?.trim() || null,
      posicao: count,
    },
  });
  revalidatePath("/admin/clientes");
  return { success: "Passo adicionado." };
}

export async function togglePassoAction(passoId: string) {
  await requireAuth();
  const p = await prisma.clientePasso.findUnique({ where: { id: passoId } });
  if (!p) return { error: "Passo não encontrado." };
  await prisma.clientePasso.update({
    where: { id: passoId },
    data: { concluido: !p.concluido, concluidoEm: !p.concluido ? new Date() : null },
  });
  revalidatePath("/admin/clientes");
  return { success: "Passo atualizado." };
}

export async function deletePassoAction(passoId: string) {
  await requireAuth();
  await prisma.clientePasso.delete({ where: { id: passoId } });
  revalidatePath("/admin/clientes");
  return { success: "Passo removido." };
}

/** Importa e-mails recebidos de uma caixa IMAP e vincula ao cliente pelo remetente */
export async function importEmailsRecebidosAction(
  clienteId: string,
  mailbox = "INBOX",
  limit = 50,
) {
  const user = await requireAuth();
  const { ImapFlow } = await import("imapflow");
  const host = process.env.IMAP_HOST || "mailserver";
  const port = parseInt(process.env.IMAP_PORT || "993");
  const pass = process.env.MAIL_DEFAULT_PASSWORD || "Palmaris@2026";

  const cliente = await prisma.cliente.findUnique({ where: { id: clienteId } });
  if (!cliente) return { error: "Cliente não encontrado." };

  const client = new ImapFlow({
    host, port, secure: port === 993,
    auth: { user: user.email, pass },
    logger: false,
    tls: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    const lock = await client.getMailboxLock(mailbox);
    const uids = (await client.search({ all: true }, { uid: true }) || []).slice(-limit);
    let salvos = 0;

    for (const uid of uids) {
      const msg: any = await client.fetchOne(uid, { envelope: true, uid: true }, { uid: true });
      if (!msg || !msg.envelope) continue;
      const env = msg.envelope;
      const de = env.from?.[0]?.address || "";
      const emailsCliente = [cliente.email, cliente.emailExtra].filter(Boolean).map((e) => e!.toLowerCase());
      if (!de || !emailsCliente.some((e) => env.from?.some((f: any) => f.address?.toLowerCase() === e))) continue;

      const mensagemId = env.messageId || `imap_${uid}_${clienteId}`;
      await prisma.emailRecebido.upsert({
        where: { mensagemId },
        update: {},
        create: {
          mensagemId,
          clienteId,
          de: de.toLowerCase(),
          deNome: env.from?.[0]?.name || null,
          para: env.to?.map((t: any) => t.address).join(", ") || user.email,
          subject: env.subject || "(sem assunto)",
          preview: "",
          receivedAt: env.date ? new Date(env.date) : new Date(),
        },
      });
      salvos++;
    }
    lock.release();
    await client.logout();
    revalidatePath("/admin/clientes");
    return { success: `${salvos} e-mails recebidos importados.` };
  } catch (e: any) {
    return { error: e.message };
  }
}

/** Importa vários clientes de uma vez (linhas já parseadas) */
export async function importClientesAction(
  linhas: Array<Record<string, string>>,
): Promise<{ success?: string; error?: string; criados?: number }> {
  await requireAuth();
  if (!Array.isArray(linhas) || linhas.length === 0) {
    return { error: "Nenhum cliente para importar." };
  }
  let criados = 0;
  try {
    for (const linha of linhas) {
      const nome = (linha.nome || "").trim();
      if (!nome) continue;
      await prisma.cliente.create({
        data: {
          nome,
          empresa: linha.empresa?.trim() || null,
          cargo: linha.cargo?.trim() || null,
          telefone: linha.telefone?.trim() || null,
          email: linha.email?.trim().toLowerCase() || null,
          emailExtra: linha.emailExtra?.trim().toLowerCase() || null,
          origem: linha.origem?.trim() || "importacao",
          tags: linha.tags?.trim() || null,
          notas: linha.notas?.trim() || null,
        },
      });
      criados++;
    }
    revalidatePath("/admin/clientes");
    return { success: `${criados} clientes importados.`, criados };
  } catch (e: any) {
    return { error: e.message || "Erro ao importar." };
  }
}

/** Retorna (ou cria automaticamente) o cliente correspondente a um JID do WhatsApp,
 *  já com o histórico de e-mails enviados/recebidos vinculados. */
export async function garantirClientePorWhatsappAction(
  jid: string,
  nomeContato?: string,
): Promise<{
  id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  empresa: string | null;
  emailsEnviados: Array<{ id: string; subject: string | null; sentAt: string; opened: boolean; bounced: boolean }>;
  emailsRecebidos: Array<{ id: string; de: string; subject: string | null; receivedAt: string }>;
  mensagensWhatsapp: number;
} | null> {
  await requireAuth();

  const telefone = jid.replace(/@.*/, "").replace(/\D/g, "");
  if (!telefone) return null;

  // Normaliza telefone: remove DDI 55 se tiver 13 digitos
  let tel = telefone;
  if (tel.length === 13 && tel.startsWith("55")) tel = tel.slice(2);
  const telE164 = `55${tel}`;

  // Busca cliente pelo telefone (com DDI ou sem)
  let cliente = await prisma.cliente.findFirst({
    where: {
      OR: [
        { telefone: telE164 },
        { telefone: tel },
        { telefone: { contains: tel } },
      ],
    },
  });

  if (!cliente) {
    cliente = await prisma.cliente.create({
      data: {
        nome: nomeContato?.trim() || `WhatsApp ${tel}`,
        telefone: telE164,
        origem: "whatsapp",
        responsavel: (await requireAuth()).email,
      },
    });
    revalidatePath("/admin/clientes");
  }

  // Buscar e-mails enviados/recebidos para qualquer e-mail do cliente
  const emails = [cliente.email, cliente.emailExtra].filter(Boolean).map((e) => e!.toLowerCase());
  const [sends, recebidos, bounces, msgsCount] = await Promise.all([
    emails.length ? prisma.emailSend.findMany({ where: { recipient: { in: emails } }, orderBy: { sentAt: "desc" }, take: 50 }) : Promise.resolve([]),
    emails.length ? prisma.emailRecebido.findMany({ where: { de: { in: emails } }, orderBy: { receivedAt: "desc" }, take: 50 }) : Promise.resolve([]),
    emails.length ? prisma.emailBounce.findMany({ where: { recipient: { in: emails } } }) : Promise.resolve([]),
    prisma.whatsappMessage.count({ where: { clienteId: cliente.id } }),
  ]);

  const opens = sends.length
    ? await prisma.emailOpen.findMany({ where: { trackingId: { in: sends.map((s) => s.trackingId) } }, select: { trackingId: true } })
    : [];
  const openIds = new Set(opens.map((o) => o.trackingId));
  const bounceEmails = new Set(bounces.map((b) => b.recipient.toLowerCase()));

  return {
    id: cliente.id,
    nome: cliente.nome,
    telefone: cliente.telefone,
    email: cliente.email,
    empresa: cliente.empresa,
    emailsEnviados: sends.map((s) => ({
      id: s.id, subject: s.subject, sentAt: s.sentAt.toISOString(),
      opened: openIds.has(s.trackingId), bounced: bounceEmails.has(s.recipient.toLowerCase()),
    })),
    emailsRecebidos: recebidos.map((r) => ({
      id: r.id, de: r.de, subject: r.subject, receivedAt: r.receivedAt.toISOString(),
    })),
    mensagensWhatsapp: msgsCount,
  };
}
