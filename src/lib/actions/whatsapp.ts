"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/guard";

const PLUGA_URL = process.env.PLUGAREST_API_URL || "http://localhost:8130";

async function pw(path: string, init?: RequestInit) {
  const res = await fetch(PLUGA_URL.replace(/\/$/, "") + path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    cache: "no-store",
  });
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) throw new Error((data && (data.message || data.error)) || `HTTP ${res.status}`);
  return data;
}

export async function listSessionsAction() {
  await requireAuth();
  try {
    const r = await pw("/api/sessions");
    return { sessions: r.sessions || [] };
  } catch (e: any) {
    return { error: e.message, sessions: [] };
  }
}

export async function createSessionAction(name: string) {
  await requireAuth();
  try {
    const r = await pw("/api/sessions", { method: "POST", body: JSON.stringify({ name }) });
    return { success: "Sessão criada.", id: r.id };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function pairSessionAction(sid: string) {
  await requireAuth();
  try {
    await pw(`/api/sessions/${sid}/pair`, { method: "POST" });
    return { success: "Pareamento iniciado." };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function reconnectSessionAction(sid: string) {
  await requireAuth();
  try {
    await pw(`/api/sessions/${sid}/reconnect`, { method: "POST" });
    return { success: "Reconectado." };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function listChatsAction(sid: string) {
  await requireAuth();
  try {
    const r = await pw(`/api/sessions/${sid}/chats`);
    return { chats: r.chats || r.conversations || [] };
  } catch (e: any) {
    return { error: e.message, chats: [] };
  }
}

export async function listMessagesAction(sid: string, jid: string) {
  await requireAuth();
  try {
    const r = await pw(`/api/sessions/${sid}/chats/${encodeURIComponent(jid)}/messages`);
    const msgs = r.messages || r.results || [];
    return { messages: msgs.slice(-100) };
  } catch (e: any) {
    return { error: e.message, messages: [] };
  }
}

export async function sendMessageAction(sid: string, to: string, message: string, clienteId?: string) {
  await requireAuth();
  try {
    await pw(`/api/sessions/${sid}/messages`, {
      method: "POST",
      body: JSON.stringify({ to, message }),
    });
    // Salvar no banco
    await prisma.whatsappMessage.create({
      data: {
        clienteId: clienteId || null,
        sessionId: sid,
        jid: to,
        direction: "outbound",
        texto: message,
      },
    });
    revalidatePath("/admin/clientes");
    return { success: "Mensagem enviada." };
  } catch (e: any) {
    return { error: e.message };
  }
}

/** Vincula um jid a um cliente e importa as últimas mensagens para o banco */
export async function syncChatAction(sid: string, jid: string, clienteId: string) {
  await requireAuth();
  try {
    const r = await pw(`/api/sessions/${sid}/chats/${encodeURIComponent(jid)}/messages`);
    const msgs = r.messages || r.results || [];
    let salvos = 0;
    for (const m of msgs) {
      const texto = typeof m.message === "string" ? m.message : m.text || m.content || "";
      const incoming = m.fromMe === false || m.key?.fromMe === false || m.direction === "inbound";
      const msgId = m.key?.id || m.id || `${sid}_${jid}_${m.timestamp || Date.now()}_${salvos}`;
      await prisma.whatsappMessage.upsert({
        where: { mensagemId: msgId },
        update: {},
        create: {
          mensagemId: msgId,
          clienteId,
          sessionId: sid,
          jid,
          direction: incoming ? "inbound" : "outbound",
          texto,
          enviadoEm: m.timestamp ? new Date(Number(m.timestamp) * 1000) : new Date(),
        },
      });
      salvos++;
    }
    revalidatePath("/admin/clientes");
    return { success: `${salvos} mensagens sincronizadas.` };
  } catch (e: any) {
    return { error: e.message };
  }
}


/** Retorna o QR code atual de uma sessao (para pareamento) */
export async function getSessionQrAction(sid: string): Promise<{ qr?: string; paired?: boolean; error?: string }> {
  await requireAuth();
  try {
    const r = await pw("/api/sessions");
    const session = (r.sessions || []).find((s: any) => s.id === sid);
    if (!session) return { error: "Sessão não encontrada." };
    return { qr: session.qr || "", paired: !!session.paired };
  } catch (e: any) {
    return { error: e.message };
  }
}

/** Vincula uma conversa (jid) a um cliente e importa as mensagens para o banco */
export async function vincularConversaAction(
  sid: string,
  jid: string,
  clienteId: string,
): Promise<{ success?: string; error?: string }> {
  await requireAuth();
  try {
    const r = await pw(`/api/sessions/${sid}/chats/${encodeURIComponent(jid)}/messages`);
    const msgs = r.messages || [];
    let salvos = 0;
    for (const m of msgs) {
      const texto = m.content || m.text || m.message || "";
      const fromMe = m.fromMe === true;
      const msgId = m.id || `${sid}_${jid}_${m.timestamp || Date.now()}_${salvos}`;
      await prisma.whatsappMessage.upsert({
        where: { mensagemId: msgId },
        update: {},
        create: {
          mensagemId: msgId,
          clienteId,
          sessionId: sid,
          jid,
          direction: fromMe ? "outbound" : "inbound",
          texto: String(texto),
          mediaUrl: m.mediaUrl || null,
          mediaType: m.mediaType || null,
          enviadoEm: m.timestamp ? new Date(m.timestamp) : new Date(),
        },
      });
      salvos++;
    }
    revalidatePath("/admin/clientes");
    return { success: `${salvos} mensagens vinculadas ao cliente.` };
  } catch (e: any) {
    return { error: e.message };
  }
}

/** Retorna o cliente vinculado a um jid (se houver) */
export async function getClientePorJidAction(jid: string) {
  await requireAuth();
  const msg = await prisma.whatsappMessage.findFirst({
    where: { jid },
    orderBy: { enviadoEm: "desc" },
    select: { clienteId: true, cliente: { select: { id: true, nome: true, empresa: true } } },
  });
  return msg?.cliente || null;
}

/** Lista todos os clientes (para o select de vinculacao) */
export async function listClientesSimplesAction() {
  await requireAuth();
  const clientes = await prisma.cliente.findMany({
    orderBy: { nome: "asc" },
    select: { id: true, nome: true, empresa: true, telefone: true },
  });
  return clientes;
}

/** Lista contatos do WhatsApp (jid -> nome) */
export async function listContactsAction(sid: string): Promise<Record<string, string>> {
  await requireAuth();
  try {
    const r = await pw(`/api/sessions/${sid}/contacts`);
    const lista = r.contacts || [];
    const mapa: Record<string, string> = {};
    for (const c of lista) if (c.jid && c.name) mapa[c.jid] = c.name;
    return mapa;
  } catch {
    return {};
  }
}

/** Retorna a URL do avatar de um jid */
export async function getAvatarAction(sid: string, jid: string): Promise<string> {
  await requireAuth();
  try {
    const r = await pw(`/api/sessions/${sid}/avatar?jid=${encodeURIComponent(jid)}`);
    return r.url || "";
  } catch {
    return "";
  }
}

/** Faz proxy de uma midia do WhatsApp (evita expor a URL direta) */
export async function proxyMediaAction(url: string): Promise<string> {
  await requireAuth();
  try {
    const r = await pw("/api/media/proxy", { method: "POST", body: JSON.stringify({ url }) });
    return r.dataUrl || "";
  } catch {
    return "";
  }
}
