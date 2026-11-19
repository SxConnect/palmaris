"use client";

import { useEffect, useState, useCallback } from "react";
import {
  listClientesAction,
  getClienteAction,
  createClienteAction,
  updateClienteAction,
  deleteClienteAction,
  addPassoAction,
  togglePassoAction,
  deletePassoAction,
  type ClienteItem,
} from "@/lib/actions/crm";
import { importEmailsRecebidosAction } from "@/lib/actions/crm";
import {
  listSessionsAction,
  createSessionAction,
  pairSessionAction,
  reconnectSessionAction,
  listChatsAction,
  listMessagesAction,
  sendMessageAction,
  syncChatAction,
} from "@/lib/actions/whatsapp";
import WhatsappTab from "./WhatsappTab";
import EmailsTab from "./EmailsTab";
import ImportarCsv from "./ImportarCsv";
import WhatsappConnectModal from "./WhatsappConnectModal";

type ClienteDetalhe = Awaited<ReturnType<typeof getClienteAction>>;

type Aba = "dados" | "passos" | "whatsapp" | "emails";

export default function ClientesClient() {
  const [clientes, setClientes] = useState<ClienteItem[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [detalhe, setDetalhe] = useState<ClienteDetalhe>(null);
  const [aba, setAba] = useState<Aba>("dados");
  const [busca, setBusca] = useState("");
  const [novo, setNovo] = useState(false);
  const [importarCsv, setImportarCsv] = useState(false);
  const [whatsappModal, setWhatsappModal] = useState(false);
  const [erro, setErro] = useState("");
  const [msg, setMsg] = useState("");

  const carregar = useCallback(async () => {
    const list = await listClientesAction();
    setClientes(list);
  }, []);

  const abrir = useCallback(async (id: string) => {
    setSelected(id);
    setDetalhe(await getClienteAction(id));
    setAba("dados");
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const filtered = clientes.filter((c) => {
    if (!busca) return true;
    const q = busca.toLowerCase();
    return [c.nome, c.empresa, c.telefone, c.email, c.indicadoPorNome]
      .some((v) => v && v.toLowerCase().includes(q));
  });

  const excluir = async () => {
    if (!selected || !window.confirm("Remover este cliente e todos os seus dados?")) return;
    await deleteClienteAction(selected);
    setSelected(null);
    setDetalhe(null);
    await carregar();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">👥 Clientes — CRM</h1>
          <p className="mt-1 text-sm text-slate-500">
            Um único lugar para cada cliente: dados, passos, WhatsApp e e-mails.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setWhatsappModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700"
          >
            💬 Conectar WhatsApp
          </button>
          <a
            href="/admin/clientes/modelo-csv"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            ⬇️ Modelo CSV
          </a>
          <button
            onClick={() => setImportarCsv(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            📥 Importar CSV
          </button>
          <button
            onClick={() => setNovo(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
          >
            + Novo cliente
          </button>
        </div>
      </div>

      {(erro || msg) && (
        <div className={`rounded-lg border p-3 text-xs font-medium ${erro ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"}`}>
          {erro || msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Lista de clientes */}
        <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="p-3 border-b border-slate-200">
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar cliente, empresa, telefone..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-brand-500"
            />
          </div>
          <div className="divide-y divide-slate-100 max-h-[70vh] overflow-y-auto">
            {filtered.length === 0 && (
              <p className="p-5 text-center text-sm text-slate-400">Nenhum cliente encontrado.</p>
            )}
            {filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => abrir(c.id)}
                className={`w-full text-left p-3 transition ${selected === c.id ? "bg-brand-50 border-l-4 border-brand-600" : "hover:bg-slate-50"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-slate-900 truncate">{c.nome}</p>
                    <p className="text-[11px] text-slate-500 truncate">{c.empresa || "—"}{c.cargo ? ` · ${c.cargo}` : ""}</p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {c.telefone || "sem telefone"} {c.email ? `· ${c.email}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {c.passosCount > 0 && (
                      <span className="text-[10px] rounded bg-slate-100 text-slate-600 px-1.5 py-0.5">
                        {c.passosFeitos}/{c.passosCount}
                      </span>
                    )}
                    {c.msgsCount > 0 && (
                      <span className="text-[10px] rounded bg-green-50 text-green-700 px-1.5 py-0.5">💬{c.msgsCount}</span>
                    )}
                  </div>
                </div>
                {c.indicadoPorNome && (
                  <p className="text-[10px] text-brand-600 mt-1">indicado por {c.indicadoPorNome}</p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Detalhe do cliente */}
        <div className="lg:col-span-8 rounded-xl border border-slate-200 bg-white overflow-hidden min-h-[70vh]">
          {!detalhe ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <span className="text-5xl mb-3">👥</span>
              <p className="text-sm font-medium text-slate-500">Selecione um cliente</p>
              <p className="text-xs text-slate-400 mt-1">Ou crie um novo para começar o atendimento.</p>
            </div>
          ) : (
            <>
              {/* Cabeçalho do cliente */}
              <div className="p-4 border-b border-slate-200 bg-slate-50/60">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{detalhe.nome}</h2>
                    <p className="text-xs text-slate-500">
                      {detalhe.empresa || "—"} {detalhe.cargo ? `· ${detalhe.cargo}` : ""}
                      {detalhe.indicadoPorNome ? ` · indicado por ${detalhe.indicadoPorNome}` : ""}
                    </p>
                  </div>
                  <button onClick={excluir} className="self-start text-xs text-red-600 hover:underline">Remover cliente</button>
                </div>
                {/* Abas */}
                <div className="flex gap-1 mt-3 flex-wrap">
                  {([
                    ["dados", "📋 Dados"],
                    ["passos", `✅ Passos (${detalhe.passos.length})`],
                    ["whatsapp", "💬 WhatsApp"],
                    ["emails", `📧 E-mails (${detalhe.emailsEnviados.length})`],
                  ] as const).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setAba(key)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                        aba === key ? "bg-brand-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4">
                {aba === "dados" && (
                  <DadosTab
                    detalhe={detalhe}
                    clientes={clientes}
                    onImport={async () => {
                      const r = await importEmailsRecebidosAction(detalhe.id);
                      if (r.error) setErro(r.error);
                      else setMsg(r.success || "E-mails importados.");
                      setDetalhe(await getClienteAction(detalhe.id));
                    }}
                    onSave={async (dados) => {
                      await updateClienteAction(detalhe.id, dados);
                      setMsg("Dados salvos.");
                      await Promise.all([carregar(), (async () => setDetalhe(await getClienteAction(detalhe.id)))()]);
                    }}
                  />
                )}
                {aba === "passos" && (
                  <PassosTab
                    detalhe={detalhe}
                    onAdd={async (titulo, descricao) => {
                      await addPassoAction(detalhe.id, titulo, descricao);
                      setDetalhe(await getClienteAction(detalhe.id));
                    }}
                    onToggle={async (id) => {
                      await togglePassoAction(id);
                      setDetalhe(await getClienteAction(detalhe.id));
                    }}
                    onDelete={async (id) => {
                      await deletePassoAction(id);
                      setDetalhe(await getClienteAction(detalhe.id));
                    }}
                  />
                )}
                {aba === "whatsapp" && (
                  <WhatsappTab
                    detalhe={detalhe}
                    onMessage={async (sid, to, texto) => {
                      const r = await sendMessageAction(sid, to, texto, detalhe.id);
                      if (r.error) setErro(r.error);
                      setDetalhe(await getClienteAction(detalhe.id));
                    }}
                    onSync={async (sid, jid) => {
                      const r = await syncChatAction(sid, jid, detalhe.id);
                      if (r.error) setErro(r.error);
                      else setMsg(r.success || "");
                      setDetalhe(await getClienteAction(detalhe.id));
                      await carregar();
                    }}
                    listSessions={listSessionsAction}
                    createSession={createSessionAction}
                    pairSession={pairSessionAction}
                    reconnectSession={reconnectSessionAction}
                    listChats={listChatsAction}
                    listMessages={listMessagesAction}
                  />
                )}
                {aba === "emails" && <EmailsTab detalhe={detalhe} />}
              </div>
            </>
          )}
        </div>
      </div>

      {whatsappModal && <WhatsappConnectModal onClose={() => setWhatsappModal(false)} />}

      {importarCsv && (
        <ImportarCsv
          onClose={() => setImportarCsv(false)}
          onImportado={async (msg) => {
            setMsg(msg);
            await carregar();
          }}
        />
      )}

      {novo && (
        <NovoClienteModal
          clientes={clientes}
          onClose={() => setNovo(false)}
          onCreated={async (id) => {
            setNovo(false);
            await carregar();
            await abrir(id);
          }}
          onError={setErro}
        />
      )}
    </div>
  );
}

/* ---------- Aba Dados ---------- */
function DadosTab({
  detalhe,
  clientes,
  onSave,
  onImport,
}: {
  detalhe: NonNullable<ClienteDetalhe>;
  clientes: ClienteItem[];
  onSave: (dados: Record<string, string | null>) => void;
  onImport: () => void;
}) {
  const [form, setForm] = useState({
    nome: detalhe.nome,
    empresa: detalhe.empresa || "",
    cargo: detalhe.cargo || "",
    telefone: detalhe.telefone || "",
    email: detalhe.email || "",
    emailExtra: detalhe.emailExtra || "",
    indicadoPorId: detalhe.indicadoPorId || "",
    origem: detalhe.origem || "",
    tags: detalhe.tags || "",
    notas: detalhe.notas || "",
    responsavel: detalhe.responsavel || "",
  });
  const campo = (k: keyof typeof form) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm({ ...form, [k]: e.target.value }),
  });

  const totalEventos =
    (detalhe.emailsEnviados?.length || 0) +
    (detalhe.emailsRecebidos?.length || 0) +
    (detalhe.mensagens?.length || 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-lg bg-brand-50/60 border border-brand-200 p-3">
        <div>
          <p className="text-xs font-bold text-brand-800">📊 Histórico deste cliente</p>
          <p className="text-[11px] text-brand-700">
            {detalhe.emailsEnviados?.length || 0} e-mails enviados · {detalhe.emailsRecebidos?.length || 0} recebidos · {detalhe.mensagens?.length || 0} mensagens WhatsApp · {detalhe.passos.length} passos
          </p>
        </div>
        <button type="button" onClick={onImport} className="self-start rounded-lg border border-brand-300 bg-white px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50">
          ↻ Importar e-mails
        </button>
      </div>
      <p className="text-[11px] text-slate-500">
        Para ver o conteúdo completo, use as abas <strong>E-mails</strong> e <strong>WhatsApp</strong>. Total de interações registradas: <strong>{totalEventos}</strong>.
      </p>
      <form
      onSubmit={(e) => { e.preventDefault(); onSave(form); }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block text-xs font-semibold text-slate-700">Nome *
          <input required {...campo("nome")} className="input mt-1" />
        </label>
        <label className="block text-xs font-semibold text-slate-700">Empresa
          <input {...campo("empresa")} className="input mt-1" />
        </label>
        <label className="block text-xs font-semibold text-slate-700">Cargo
          <input {...campo("cargo")} className="input mt-1" />
        </label>
        <label className="block text-xs font-semibold text-slate-700">Telefone / WhatsApp
          <input {...campo("telefone")} placeholder="5521999999999" className="input mt-1" />
        </label>
        <label className="block text-xs font-semibold text-slate-700">E-mail
          <input type="email" {...campo("email")} className="input mt-1" />
        </label>
        <label className="block text-xs font-semibold text-slate-700">E-mail extra
          <input type="email" {...campo("emailExtra")} className="input mt-1" />
        </label>
        <label className="block text-xs font-semibold text-slate-700">Quem indicou
          <select {...campo("indicadoPorId")} className="input mt-1">
            <option value="">— ninguém —</option>
            {clientes.filter((c) => c.id !== detalhe.id).map((c) => (
              <option key={c.id} value={c.id}>{c.nome}{c.empresa ? ` (${c.empresa})` : ""}</option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-semibold text-slate-700">Origem
          <input {...campo("origem")} placeholder="visita, indicação, campanha..." className="input mt-1" />
        </label>
      </div>
      <label className="block text-xs font-semibold text-slate-700">Tags (separadas por vírgula)
        <input {...campo("tags")} className="input mt-1" />
      </label>
      <label className="block text-xs font-semibold text-slate-700">Notas rápidas
        <textarea {...campo("notas")} rows={4} className="input mt-1" placeholder="Anote aqui o que o técnico passou..." />
      </label>
      <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
        Salvar dados
      </button>
      </form>
    </div>
  );
}

/* ---------- Aba Passos ---------- */
function PassosTab({
  detalhe,
  onAdd,
  onToggle,
  onDelete,
}: {
  detalhe: NonNullable<ClienteDetalhe>;
  onAdd: (titulo: string, descricao?: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [titulo, setTitulo] = useState("");
  const sugestoes = ["Primeiro contato", "Email enviado", "Mensagem via WhatsApp", "Catálogo enviado", "Pediu orçamento", "Proposta enviada", "Follow-up", "Fechado"];
  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {sugestoes.map((s) => (
          <button key={s} onClick={() => setTitulo(s)} className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] text-slate-600 hover:bg-brand-50 hover:border-brand-300">
            + {s}
          </button>
        ))}
      </div>
      <form
        onSubmit={(e) => { e.preventDefault(); if (!titulo.trim()) return; onAdd(titulo); setTitulo(""); }}
        className="flex gap-2"
      >
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Novo passo (ex: enviou proposta empresa X)" className="input flex-1 text-xs" />
        <button type="submit" className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white">+ Adicionar</button>
      </form>
      {detalhe.passos.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-6">Nenhum passo ainda. Clique em uma sugestão ou crie o seu.</p>
      ) : (
        <ol className="space-y-2">
          {detalhe.passos.map((p, i) => (
            <li key={p.id} className={`flex items-center gap-3 rounded-lg border p-3 ${p.concluido ? "bg-green-50/50 border-green-200" : "bg-white border-slate-200"}`}>
              <button onClick={() => onToggle(p.id)} className="text-lg" title="Marcar/desmarcar">
                {p.concluido ? "✅" : "⏳"}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${p.concluido ? "text-slate-500 line-through" : "text-slate-800"}`}>
                  {i + 1}. {p.titulo}
                </p>
                {p.descricao && <p className="text-[11px] text-slate-500">{p.descricao}</p>}
                {p.concluidoEm && <p className="text-[10px] text-slate-400">concluído em {new Date(p.concluidoEm).toLocaleString("pt-BR")}</p>}
              </div>
              <button onClick={() => onDelete(p.id)} className="text-xs text-red-500 hover:underline">excluir</button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

/* ---------- Modal Novo Cliente ---------- */
function NovoClienteModal({
  clientes,
  onClose,
  onCreated,
  onError,
}: {
  clientes: ClienteItem[];
  onClose: () => void;
  onCreated: (id: string) => void;
  onError: (e: string) => void;
}) {
  const [form, setForm] = useState({
    nome: "", empresa: "", cargo: "", telefone: "", email: "", emailExtra: "",
    indicadoPorId: "", origem: "", tags: "", notas: "",
  });
  const campo = (k: keyof typeof form) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm({ ...form, [k]: e.target.value }),
  });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const r = await createClienteAction(form);
            if (r.error) onError(r.error);
            else if (r.id) onCreated(r.id);
          }}
          className="p-5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Novo cliente</h3>
            <button type="button" onClick={onClose} className="text-slate-400 text-lg">✕</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block text-xs font-semibold text-slate-700">Nome *
              <input required {...campo("nome")} className="input mt-1" />
            </label>
            <label className="block text-xs font-semibold text-slate-700">Empresa
              <input {...campo("empresa")} className="input mt-1" />
            </label>
            <label className="block text-xs font-semibold text-slate-700">Cargo
              <input {...campo("cargo")} className="input mt-1" />
            </label>
            <label className="block text-xs font-semibold text-slate-700">Telefone/WhatsApp
              <input {...campo("telefone")} placeholder="5521999999999" className="input mt-1" />
            </label>
            <label className="block text-xs font-semibold text-slate-700">E-mail
              <input type="email" {...campo("email")} className="input mt-1" />
            </label>
            <label className="block text-xs font-semibold text-slate-700">Quem indicou
              <select {...campo("indicadoPorId")} className="input mt-1">
                <option value="">— ninguém —</option>
                {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </label>
            <label className="block text-xs font-semibold text-slate-700">Origem
              <input {...campo("origem")} className="input mt-1" />
            </label>
            <label className="block text-xs font-semibold text-slate-700">Tags
              <input {...campo("tags")} className="input mt-1" />
            </label>
          </div>
          <label className="block text-xs font-semibold text-slate-700">Notas rápidas
            <textarea {...campo("notas")} rows={3} className="input mt-1" />
          </label>
          <button type="submit" className="w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
            Criar cliente
          </button>
        </form>
      </div>
    </div>
  );
}
