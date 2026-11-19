"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listSessionsAction,
  listChatsAction,
  listMessagesAction,
  sendMessageAction,
  getSessionQrAction,
  pairSessionAction,
  createSessionAction as createSession,
  vincularConversaAction,
  getClientePorJidAction,
  listClientesSimplesAction,
} from "@/lib/actions/whatsapp";
import QrCode from "@/app/admin/(panel)/clientes/QrCode";

type Chat = { jid: string; lastMessage?: string; lastTime?: string; name?: string };

export default function WhatsappInbox() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [sid, setSid] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [jid, setJid] = useState("");
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [texto, setTexto] = useState("");
  const [busca, setBusca] = useState("");
  const [erro, setErro] = useState("");
  const [info, setInfo] = useState("");
  const [qr, setQr] = useState("");
  const [pareando, setPareando] = useState(false);
  const [clienteAtual, setClienteAtual] = useState<any>(null);
  const [clientes, setClientes] = useState<any[]>([]);
  const [vincularId, setVincularId] = useState("");

  const carregarSessions = useCallback(async () => {
    const r = await listSessionsAction();
    if (r.error) setErro(r.error);
    else {
      setSessions(r.sessions);
      const ativa = r.sessions.find((s: any) => s.paired || s.state === "open");
      if (ativa) setSid((old) => old || ativa.id);
    }
  }, []);

  useEffect(() => { carregarSessions(); listClientesSimplesAction().then(setClientes); }, [carregarSessions]);

  // Atualizar chats
  useEffect(() => {
    if (!sid) return;
    const atualizar = async () => {
      const r = await listChatsAction(sid);
      if (!r.error) setChats(r.chats || []);
    };
    atualizar();
    const int = setInterval(atualizar, 5000);
    return () => clearInterval(int);
  }, [sid]);

  // Atualizar mensagens da conversa aberta
  useEffect(() => {
    if (!sid || !jid) return;
    const atualizar = async () => {
      const r = await listMessagesAction(sid, jid);
      if (!r.error) setMensagens(r.messages || []);
    };
    atualizar();
    const int = setInterval(atualizar, 3000);
    return () => clearInterval(int);
  }, [sid, jid]);

  // Polling do QR
  useEffect(() => {
    if (!pareando || !sid) return;
    const buscar = async () => {
      const r = await getSessionQrAction(sid);
      if (r.error) return;
      if (r.paired) { setPareando(false); setQr(""); setInfo("WhatsApp conectado!"); await carregarSessions(); return; }
      if (r.qr) setQr(r.qr);
    };
    buscar();
    const int = setInterval(buscar, 2500);
    return () => clearInterval(int);
  }, [pareando, sid, carregarSessions]);

  const abrirChat = async (chatJid: string) => {
    setJid(chatJid);
    const [msgs, cli] = await Promise.all([
      listMessagesAction(sid, chatJid),
      getClientePorJidAction(chatJid),
    ]);
    if (!msgs.error) setMensagens(msgs.messages || []);
    setClienteAtual(cli);
    setVincularId(cli?.id || "");
  };

  const enviar = async () => {
    if (!sid || !jid || !texto.trim()) return;
    const r = await sendMessageAction(sid, jid, texto.trim(), clienteAtual?.id);
    if (r.error) setErro(r.error);
    else {
      setTexto("");
      const msgs = await listMessagesAction(sid, jid);
      if (!msgs.error) setMensagens(msgs.messages || []);
    }
  };

  const gerarQr = async () => {
    let id = sid;
    if (!id) {
      const r = await createSession("Palmaris");
      if (r.error) { setErro(r.error); return; }
      if (!r.id) { setErro("Erro ao criar sessão."); return; }
      id = r.id; setSid(id); await carregarSessions();
    }
    const p = await pairSessionAction(id);
    if (p.error) { setErro(p.error); return; }
    setPareando(true); setQr(""); setInfo("Escaneie o QR com o WhatsApp.");
  };

  const vincular = async () => {
    if (!vincularId || !jid) return;
    const r = await vincularConversaAction(sid, jid, vincularId);
    if (r.error) setErro(r.error);
    else { setInfo(r.success || "Vinculado."); setClienteAtual(clientes.find((c) => c.id === vincularId)); }
  };

  const chatsFiltrados = chats.filter((c) => {
    if (!busca) return true;
    const q = busca.toLowerCase();
    return (c.jid || "").toLowerCase().includes(q) || (c.lastMessage || "").toLowerCase().includes(q);
  });

  const sessaoAtiva = sessions.find((s) => s.id === sid);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">💬 WhatsApp — Caixa de Entrada</h1>
          <p className="mt-1 text-sm text-slate-500">
            {chats.length} conversas {sessaoAtiva ? `· conectado como ${sessaoAtiva.jid || "WhatsApp"}` : "· selecione uma sessão"}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <select value={sid} onChange={(e) => setSid(e.target.value)} className="input text-xs max-w-[220px]">
            <option value="">— sessão —</option>
            {sessions.map((s) => <option key={s.id} value={s.id}>{s.name || s.id} {s.paired ? "🟢" : "⚪"}</option>)}
          </select>
          <button onClick={gerarQr} className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white">📱 Gerar QR</button>
        </div>
      </div>

      {(erro || info) && <div className={`rounded-lg border p-3 text-xs ${erro ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"}`}>{erro || info}</div>}

      {pareando && (
        <div className="rounded-lg border border-brand-200 bg-brand-50/40 p-4 flex flex-col items-center gap-2">
          <p className="text-xs font-bold text-brand-800">📱 Escaneie o QR com o WhatsApp</p>
          {qr ? <QrCode valor={qr} /> : <p className="text-xs text-slate-500">Gerando QR...</p>}
          <p className="text-[11px] text-slate-500 text-center">WhatsApp → Menu ⋮ → Aparelhos conectados → Conectar aparelho</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Lista de conversas */}
        <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="p-2 border-b border-slate-200">
            <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar conversa..." className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" />
          </div>
          <div className="max-h-[70vh] overflow-y-auto divide-y divide-slate-100">
            {chatsFiltrados.length === 0 && <p className="p-4 text-center text-xs text-slate-400">Nenhuma conversa encontrada.</p>}
            {chatsFiltrados.map((c) => (
              <button key={c.jid} onClick={() => abrirChat(c.jid)} className={`w-full text-left p-3 hover:bg-slate-50 ${jid === c.jid ? "bg-brand-50 border-l-4 border-brand-600" : ""}`}>
                <p className="text-sm font-semibold text-slate-800 truncate">{c.name || c.jid}</p>
                <p className="text-[11px] text-slate-500 truncate">{c.lastMessage || "—"}</p>
                <p className="text-[10px] text-slate-400">{c.lastTime ? new Date(c.lastTime).toLocaleString("pt-BR") : ""}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Conversa */}
        <div className="lg:col-span-8 rounded-xl border border-slate-200 bg-white overflow-hidden flex flex-col min-h-[70vh]">
          {!jid ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <span className="text-5xl mb-3">💬</span>
              <p className="text-sm">Selecione uma conversa</p>
            </div>
          ) : (
            <>
              <div className="p-3 border-b border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-slate-900 truncate">{jid}</p>
                  {clienteAtual && <p className="text-[11px] text-green-700">👤 {clienteAtual.nome}{clienteAtual.empresa ? ` · ${clienteAtual.empresa}` : ""}</p>}
                </div>
                <div className="flex gap-2">
                  <select value={vincularId} onChange={(e) => setVincularId(e.target.value)} className="input text-[11px] max-w-[180px]">
                    <option value="">— vincular a cliente —</option>
                    {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                  <button onClick={vincular} disabled={!vincularId} className="rounded-lg border border-brand-300 bg-brand-50 px-2 py-1.5 text-[11px] font-semibold text-brand-700 disabled:opacity-50">Vincular</button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/40 max-h-[55vh]">
                {mensagens.length === 0 && <p className="text-center text-xs text-slate-400 py-8">Carregando mensagens...</p>}
                {mensagens.map((m, i) => {
                  const fromMe = m.fromMe === true;
                  const txt = m.content || m.text || m.message || (m.mediaUrl ? "📎 mídia" : "");
                  return (
                    <div key={m.id || i} className={`flex ${fromMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] rounded-xl px-3 py-2 text-xs ${fromMe ? "bg-brand-600 text-white" : "bg-white border border-slate-200 text-slate-700"}`}>
                        <p className="whitespace-pre-wrap">{txt}</p>
                        <p className={`text-[9px] mt-1 ${fromMe ? "text-blue-200" : "text-slate-400"}`}>
                          {m.timestamp ? new Date(m.timestamp).toLocaleString("pt-BR") : ""}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <form onSubmit={(e) => { e.preventDefault(); enviar(); }} className="p-2 border-t border-slate-200 flex gap-2">
                <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escreva a mensagem..." className="input text-xs flex-1" />
                <button type="submit" disabled={!texto.trim()} className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">Enviar</button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
