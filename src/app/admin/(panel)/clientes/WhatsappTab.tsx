"use client";

import { useEffect, useState } from "react";
import QrCode from "./QrCode";
import { getSessionQrAction } from "@/lib/actions/whatsapp";

type Mensagem = {
  id: string;
  jid: string;
  direction: string;
  texto: string | null;
  mediaUrl: string | null;
  mediaType: string | null;
  enviadoEm: string;
};

type Detalhe = {
  telefone: string | null;
  mensagens: Mensagem[];
};

type Session = { id: string; name?: string; paired?: boolean; state?: string; status?: string };
type Chat = { jid?: string; id?: string; name?: string; subject?: string };

export default function WhatsappTab({
  detalhe,
  onMessage,
  onSync,
  listSessions,
  createSession,
  pairSession,
  reconnectSession,
  listChats,
  listMessages,
}: {
  detalhe: Detalhe;
  onMessage: (sid: string, to: string, texto: string) => Promise<void>;
  onSync: (sid: string, jid: string) => Promise<void>;
  listSessions: () => Promise<{ sessions: Session[]; error?: string }>;
  createSession: (name: string) => Promise<{ id?: string; error?: string }>;
  pairSession: (sid: string) => Promise<{ error?: string }>;
  reconnectSession: (sid: string) => Promise<{ error?: string }>;
  listChats: (sid: string) => Promise<{ chats: Chat[]; error?: string }>;
  listMessages: (sid: string, jid: string) => Promise<{ messages: any[]; error?: string }>;
}) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sid, setSid] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [jid, setJid] = useState("");
  const [remotas, setRemotas] = useState<any[]>([]);
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState("");
  const [info, setInfo] = useState("");
  const [novaSessao, setNovaSessao] = useState("");
  const [qr, setQr] = useState("");
  const [pareando, setPareando] = useState(false);

  const carregarSessions = async () => {
    const r = await listSessions();
    if (r.error) setErro(r.error);
    else {
      setSessions(r.sessions);
      const ativa = r.sessions.find((s) => s.paired || s.state === "open") || r.sessions[0];
      if (ativa && !sid) setSid(ativa.id);
    }
  };

  useEffect(() => { carregarSessions(); }, []);

  // Faz polling do QR enquanto pareando
  useEffect(() => {
    if (!pareando || !sid) return;
    const buscar = async () => {
      const r = await getSessionQrAction(sid);
      if (r.error) return;
      if (r.paired) {
        setPareando(false);
        setQr("");
        setInfo("WhatsApp conectado com sucesso!");
        await carregarSessions();
        return;
      }
      if (r.qr) setQr(r.qr);
    };
    buscar();
    const interval = setInterval(buscar, 2500);
    return () => clearInterval(interval);
  }, [pareando, sid]);

  const conectar = async () => {
    if (!novaSessao.trim()) return;
    const r = await createSession(novaSessao.trim());
    if (r.error) setErro(r.error);
    else {
      setInfo("Sessão criada. Pareando...");
      if (r.id) {
        setSid(r.id);
        const p = await pairSession(r.id);
        if (p.error) setErro(p.error);
        else { setPareando(true); setInfo("Escaneie o QR abaixo com o WhatsApp."); }
      }
      setNovaSessao("");
      await carregarSessions();
    }
  };

  const conectarOuGerarQr = async () => {
    let sessionId = sid;
    if (!sessionId) {
      const r = await createSession(novaSessao.trim() || "Palmaris");
      if (r.error) { setErro(r.error); return; }
      if (!r.id) { setErro("Não foi possível criar a sessão."); return; }
      sessionId = r.id;
      setSid(sessionId);
      setNovaSessao("");
      await carregarSessions();
    }
    const p = await pairSession(sessionId);
    if (p.error) { setErro(p.error); return; }
    setPareando(true);
    setQr("");
    setInfo("Escaneie o QR abaixo com o WhatsApp.");
  };

  const carregarChats = async () => {
    if (!sid) return;
    const r = await listChats(sid);
    if (r.error) setErro(r.error);
    else setChats(r.chats);
  };

  const abrirChat = async (chatJid: string) => {
    setJid(chatJid);
    const r = await listMessages(sid, chatJid);
    if (r.error) setErro(r.error);
    else setRemotas(r.messages);
  };

  // Atualizacao automatica: chats a cada 5s, mensagens da conversa aberta a cada 3s
  useEffect(() => {
    if (!sid) return;
    const atualizarChats = async () => {
      const r = await listChats(sid);
      if (!r.error) setChats(r.chats);
    };
    atualizarChats();
    const intChats = setInterval(atualizarChats, 5000);
    return () => clearInterval(intChats);
  }, [sid, listChats]);

  useEffect(() => {
    if (!sid || !jid) return;
    const atualizarMsgs = async () => {
      const r = await listMessages(sid, jid);
      if (!r.error) setRemotas(r.messages);
    };
    const intMsgs = setInterval(atualizarMsgs, 3000);
    return () => clearInterval(intMsgs);
  }, [sid, jid, listMessages]);

  const enviar = async () => {
    if (!sid || !jid || !texto.trim()) return;
    await onMessage(sid, jid, texto.trim());
    setTexto("");
    const r = await listMessages(sid, jid);
    if (!r.error) setRemotas(r.messages);
  };

  const sincronizar = async () => {
    if (!sid || !jid) return;
    await onSync(sid, jid);
    setInfo("Mensagens sincronizadas para o cliente.");
  };

  const jidSugerido = detalhe.telefone
    ? `${detalhe.telefone.replace(/\D/g, "")}@s.whatsapp.net`
    : "";

  return (
    <div className="space-y-4">
      {(erro || info) && (
        <div className={`rounded-lg border p-3 text-xs ${erro ? "bg-red-50 border-red-200 text-red-700" : "bg-blue-50 border-blue-200 text-blue-700"}`}>
          {erro || info}
        </div>
      )}

      {/* Conexão */}
      <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 space-y-2">
        <p className="text-xs font-bold text-slate-700">Conexão WhatsApp (PlugaWAPI)</p>
        <div className="flex flex-wrap gap-2 items-center">
          <select value={sid} onChange={(e) => setSid(e.target.value)} className="input text-xs flex-1 min-w-[180px]">
            <option value="">— selecione a sessão —</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name || s.id} {s.paired || s.state === "open" ? "🟢" : "⚪"}
              </option>
            ))}
          </select>
          <input value={novaSessao} onChange={(e) => setNovaSessao(e.target.value)} placeholder="Nome da nova sessão" className="input text-xs w-40" />
          <button onClick={conectarOuGerarQr} className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white">
            📱 Conectar WhatsApp / Gerar QR
          </button>
          {sid && (
            <button onClick={async () => { const r = await reconnectSession(sid); if (r.error) setErro(r.error); else setInfo("Reconectado."); }} className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600">
              Reconectar
            </button>
          )}
        </div>
        <p className="text-[11px] text-slate-500">
          Clique em "Conectar WhatsApp / Gerar QR", escaneie o QR com o WhatsApp (Menu ⋮ → Aparelhos conectados). As conversas aparecem aqui depois.
        </p>
      </div>

      {/* QR Code de pareamento */}
      {(pareando || qr) && (
        <div className="rounded-lg border border-brand-200 bg-brand-50/40 p-4 flex flex-col items-center gap-2">
          <p className="text-xs font-bold text-brand-800">📱 Escaneie este QR com o WhatsApp</p>
          {qr ? <QrCode valor={qr} /> : <p className="text-xs text-slate-500">Gerando QR...</p>}
          <p className="text-[11px] text-slate-500 text-center">
            WhatsApp → Menu ⋮ → Aparelhos conectados → Conectar aparelho
          </p>
          {pareando && <button onClick={() => { setPareando(false); setQr(""); }} className="text-[11px] text-slate-500 hover:underline">Cancelar</button>}
        </div>
      )}

      {/* Chat */}
      {sid ? (
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Lista de conversas */}
          <div className="sm:col-span-4 rounded-lg border border-slate-200 overflow-hidden">
            <div className="p-2 border-b border-slate-200 flex gap-2">
              <button onClick={carregarChats} className="text-[11px] rounded bg-slate-100 px-2 py-1">↻ Atualizar</button>
              {jidSugerido && (
                <button onClick={() => setJid(jidSugerido)} className="text-[11px] rounded bg-green-50 text-green-700 px-2 py-1">
                  📱 Usar tel do cliente
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {chats.map((c, i) => {
                const cjid = c.jid || c.id || "";
                return (
                  <button key={cjid || i} onClick={() => abrirChat(cjid)} className={`w-full text-left p-2 text-xs hover:bg-slate-50 ${jid === cjid ? "bg-brand-50" : ""}`}>
                    <p className="font-semibold text-slate-800 truncate">{c.name || c.subject || cjid}</p>
                    <p className="text-[10px] text-slate-400 truncate">{cjid}</p>
                  </button>
                );
              })}
              {chats.length === 0 && <p className="p-3 text-[11px] text-slate-400">Clique em ↻ Atualizar para carregar.</p>}
            </div>
          </div>

          {/* Conversa */}
          <div className="sm:col-span-8 rounded-lg border border-slate-200 overflow-hidden flex flex-col min-h-[320px]">
            <div className="p-2 border-b border-slate-200 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-700 truncate">{jid || "Selecione uma conversa"}</p>
              {jid && <button onClick={sincronizar} className="text-[11px] rounded bg-blue-50 text-blue-700 px-2 py-1">Salvar no cliente</button>}
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/40 max-h-80">
              {remotas.length === 0 && detalhe.mensagens.length === 0 && (
                <p className="text-center text-xs text-slate-400 py-8">Nenhuma mensagem ainda.</p>
              )}
              {remotas.map((m, i) => {
                const textoM = typeof m.message === "string" ? m.message : m.text || m.content || "";
                const fromMe = m.fromMe === true || m.key?.fromMe === true;
                return (
                  <div key={i} className={`flex ${fromMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-xl px-3 py-2 text-xs ${fromMe ? "bg-brand-600 text-white" : "bg-white border border-slate-200 text-slate-700"}`}>
                      {textoM || (m.mediaUrl ? "📎 mídia" : "")}
                    </div>
                  </div>
                );
              })}
              {remotas.length === 0 && detalhe.mensagens.map((m) => (
                <div key={m.id} className={`flex ${m.direction === "outbound" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-xl px-3 py-2 text-xs ${m.direction === "outbound" ? "bg-brand-600 text-white" : "bg-white border border-slate-200 text-slate-700"}`}>
                    {m.texto || (m.mediaUrl ? "📎 mídia" : "")}
                  </div>
                </div>
              ))}
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); enviar(); }}
              className="p-2 border-t border-slate-200 flex gap-2"
            >
              <input
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder={jid ? "Escreva a mensagem..." : "Selecione uma conversa"}
                disabled={!jid}
                className="input text-xs flex-1"
              />
              <button type="submit" disabled={!jid || !texto.trim()} className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">
                Enviar
              </button>
            </form>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-400 text-center py-6">Selecione ou crie uma sessão para usar o WhatsApp.</p>
      )}
    </div>
  );
}
