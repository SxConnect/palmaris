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
} from "@/lib/actions/whatsapp";
import QrCode from "@/app/admin/(panel)/clientes/QrCode";
import MessageBubble from "./MessageBubble";
import { listContactsAction, getAvatarAction } from "@/lib/actions/whatsapp";
import { garantirClientePorWhatsappAction, listClientesComTelefoneAction } from "@/lib/actions/crm";
import FunilCard from "./FunilCard";
import DadosClienteCard from "./DadosClienteCard";
import RepresentacoesDoCliente from "@/components/RepresentacoesDoCliente";

type Chat = {
  jid: string;
  lastMessage?: string;
  lastTime?: string;
  name?: string;
  novoCliente?: boolean;
  clienteId?: string;
  empresa?: string;
};

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
  const [carregandoCliente, setCarregandoCliente] = useState(false);
  const [clientesCrm, setClientesCrm] = useState<any[]>([]);
  const [contatos, setContatos] = useState<Record<string, string>>({});
  const [avatars, setAvatars] = useState<Record<string, string>>({});

  const carregarSessions = useCallback(async () => {
    const r = await listSessionsAction();
    if (r.error) setErro(r.error);
    else {
      setSessions(r.sessions);
      const ativa = r.sessions.find((s: any) => s.paired || s.state === "open");
      if (ativa) setSid((old) => old || ativa.id);
    }
  }, []);

  useEffect(() => {
    carregarSessions();
  }, [carregarSessions]);

  useEffect(() => {
    if (!sid) return;
    listContactsAction(sid).then(setContatos);
  }, [sid]);

  // Carregar avatares das conversas visiveis (limitado a 30)
  useEffect(() => {
    if (!sid) return;
    const jids = [
      ...chats.slice(0, 30).map((c) => c.jid),
      ...clientesCrm.slice(0, 30).map((c) => `${c.telefone.replace(/\D/g, "")}@s.whatsapp.net`),
    ];
    [...new Set(jids)].forEach(async (jid) => {
      if (avatars[jid] !== undefined) return;
      const url = await getAvatarAction(sid, jid);
      setAvatars((old) => ({ ...old, [jid]: url }));
    });
  }, [sid, chats, clientesCrm]);

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
    setCarregandoCliente(true);
    const [msgs, cli] = await Promise.all([
      listMessagesAction(sid, chatJid),
      garantirClientePorWhatsappAction(chatJid, contatos[chatJid]),
    ]);
    if (!msgs.error) setMensagens(msgs.messages || []);
    setClienteAtual(cli);
    setCarregandoCliente(false);
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

  // Clientes do CRM com telefone que ainda nao tem conversa -> "novo cliente"
  const clientesSemConversa = clientesCrm
    .map((c) => {
      const digits = c.telefone.replace(/\D/g, "");
      const jid = `${digits.startsWith("55") ? digits : `55${digits}`}@s.whatsapp.net`;
      return {
        jid,
        name: c.nome,
        lastMessage: "🆕 Novo cliente — clique para enviar mensagem",
        lastTime: "",
        novoCliente: true,
        clienteId: c.id,
        empresa: c.empresa,
      } as Chat;
    })
    .filter((c) => !chats.some((ch) => ch.jid === c.jid || ch.jid.replace(/:.*/, "") === c.jid.replace(/:.*/, "")));

  const listaUnificada = [
    ...clientesSemConversa,
    ...chats.map((c) => {
      const cli = clientesCrm.find((x) => {
        const d = x.telefone.replace(/\D/g, "");
        const j = `${d.startsWith("55") ? d : `55${d}`}@s.whatsapp.net`;
        return j === c.jid || j.replace(/:.*/, "") === c.jid.replace(/:.*/, "");
      });
      return cli ? { ...c, name: c.name || cli.nome, clienteId: cli.id, empresa: cli.empresa } : c;
    }),
  ];

  const chatsFiltrados = listaUnificada.filter((c) => {
    if (!busca) return true;
    const q = busca.toLowerCase();
    return (c.jid || "").toLowerCase().includes(q)
      || (c.lastMessage || "").toLowerCase().includes(q)
      || (c.name || "").toLowerCase().includes(q)
      || (c.empresa || "").toLowerCase().includes(q);
  });

  const sessaoAtiva = sessions.find((s) => s.id === sid);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">💬 WhatsApp — Caixa de Entrada</h1>
          <p className="mt-1 text-sm text-slate-500">
            {chats.length} conversas · {clientesSemConversa.length} novos clientes {sessaoAtiva ? `· conectado como ${sessaoAtiva.jid || "WhatsApp"}` : "· selecione uma sessão"}
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
              <button key={c.jid} onClick={() => abrirChat(c.jid)} className={`w-full text-left p-3 hover:bg-slate-50 flex gap-2 items-start ${jid === c.jid ? "bg-brand-50 border-l-4 border-brand-600" : ""}`}>
                {avatars[c.jid] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatars[c.jid]} alt="" className="h-9 w-9 rounded-full object-cover shrink-0" />
                ) : (
                  <span className="h-9 w-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold shrink-0">
                    {(c.name || contatos[c.jid] || c.jid).charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {c.name || contatos[c.jid] || c.jid.replace(/@.*/, "")}
                </p>
                {c.empresa && <p className="text-[10px] text-slate-400 truncate">{c.empresa}</p>}
                <p className={`text-[11px] truncate ${c.novoCliente ? "text-green-700 font-semibold" : "text-slate-500"}`}>
                  {c.lastMessage || "—"}
                </p>
                <p className="text-[10px] text-slate-400">{c.lastTime ? new Date(c.lastTime).toLocaleString("pt-BR") : ""}</p>
                </span>
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
              {/* Painel do cliente (dados + historico de e-mails) */}
              <div className="border-b border-slate-200 bg-slate-50/60 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {contatos[jid] || jid.replace(/@.*/, "")}
                  </p>
                  <a href={clienteAtual ? `/admin/clientes` : "#"} className="text-[11px] text-brand-700 hover:underline">
                    {clienteAtual ? "👤 Cliente no CRM" : ""}
                  </a>
                </div>
                {carregandoCliente ? (
                  <p className="text-[11px] text-slate-400 mt-1">Carregando dados do cliente...</p>
                ) : clienteAtual ? (
                  <>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                    <DadosClienteCard
                      cliente={clienteAtual}
                      onSalvo={async () => setClienteAtual(await garantirClientePorWhatsappAction(jid, contatos[jid]))}
                    />
                    <div className="rounded-lg bg-white border border-slate-200 p-2">
                      <p className="font-bold text-slate-700">📧 E-mails ({clienteAtual.emailsEnviados.length + clienteAtual.emailsRecebidos.length})</p>
                      {clienteAtual.emailsEnviados.length + clienteAtual.emailsRecebidos.length === 0 ? (
                        <p className="text-slate-400">Nenhum e-mail ainda</p>
                      ) : (
                        <div className="mt-1 space-y-1 max-h-24 overflow-y-auto">
                          {clienteAtual.emailsEnviados.map((e: any) => (
                            <p key={e.id} className="text-slate-600 truncate">📤 {e.subject || "(sem assunto)"} {e.opened ? "👁️" : ""}</p>
                          ))}
                          {clienteAtual.emailsRecebidos.map((e: any) => (
                            <p key={e.id} className="text-slate-600 truncate">📥 {e.subject || "(sem assunto)"}</p>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="rounded-lg bg-white border border-slate-200 p-2">
                      <p className="font-bold text-slate-700">💬 WhatsApp</p>
                      <p className="text-slate-600">{clienteAtual.mensagensWhatsapp} mensagem(ns) salva(s)</p>
                      <p className="text-slate-500">Nesta conversa: {mensagens.length}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <FunilCard clienteId={clienteAtual.id} passosIniciais={clienteAtual.passos || []} />
                  </div>
                  <div className="mt-2">
                    <RepresentacoesDoCliente clienteId={clienteAtual.id} />
                  </div>
                  </>
                ) : (
                  <p className="text-[11px] text-slate-400 mt-1">Não foi possível carregar o cliente.</p>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/40 max-h-[55vh]">
                {mensagens.length === 0 && <p className="text-center text-xs text-slate-400 py-8">Carregando mensagens...</p>}
                {mensagens.map((m, i) => (
                  <MessageBubble key={m.id || i} msg={m} fromMe={m.fromMe === true} />
                ))}
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
