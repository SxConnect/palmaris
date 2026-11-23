"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  listRepresentacoesAction,
  saveRepresentacaoAction,
  deleteRepresentacaoAction,
  type RepresentacaoItem,
} from "@/lib/actions/representacoes";
import ImportarRepresentacoes from "./ImportarRepresentacoes";

export default function RepresentacoesClient() {
  const [reps, setReps] = useState<RepresentacaoItem[]>([]);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState<RepresentacaoItem | null>(null);
  const [erro, setErro] = useState("");
  const [importar, setImportar] = useState(false);
  const [aviso, setAviso] = useState("");

  const carregar = async () => setReps(await listRepresentacoesAction());
  useEffect(() => { carregar(); }, []);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">🏢 Representações</h1>
          <p className="mt-1 text-sm text-slate-500">
            Cadastre as marcas representadas (ENGEZER, PESCO, futuras), seus produtos e responsáveis.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setImportar(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            📥 Importar CSV
          </button>
          <button
            onClick={() => { setEdit(null); setModal(true); }}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            + Nova representação
          </button>
        </div>
      </div>

      {erro && <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700">{erro}</div>}
      {aviso && <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-xs text-green-700">{aviso}</div>}

      {reps.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-10">Nenhuma representação cadastrada.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reps.map((r) => (
            <div key={r.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden hover:shadow-md transition">
              <div className="h-28 bg-gradient-to-br from-[#0a2a6b] to-[#123a8f] flex items-center justify-center">
                {r.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.logoUrl} alt={r.nome} className="h-20 w-auto object-contain" />
                ) : (
                  <span className="text-3xl font-black text-white/80">{r.nome.charAt(0)}</span>
                )}
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-slate-900">{r.nome}</h2>
                  <span className={`text-[10px] rounded-full px-2 py-0.5 font-bold ${r.status === "ativa" ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                    {r.status}
                  </span>
                </div>
                {r.segmento && <p className="text-[11px] text-brand-700 font-semibold">{r.segmento}</p>}
                {r.descricao && <p className="text-xs text-slate-500 line-clamp-2">{r.descricao}</p>}
                {r.responsavel && <p className="text-[11px] text-slate-500">👤 {r.responsavel}</p>}
                <div className="flex gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <span>📦 {r.produtosCount} produtos</span>
                  <span>👥 {r.clientesCount} clientes</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Link href={`/admin/representacoes/${r.id}`} className="flex-1 text-center rounded-lg bg-brand-50 border border-brand-200 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100">
                    Abrir
                  </Link>
                  <button onClick={() => { setEdit(r); setModal(true); }} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50">Editar</button>
                  <button onClick={async () => {
                    if (!window.confirm(`Remover ${r.nome}?`)) return;
                    const res = await deleteRepresentacaoAction(r.id);
                    if (res.error) setErro(res.error);
                    else carregar();
                  }} className="rounded-lg border border-red-200 px-2 py-1.5 text-xs text-red-600 hover:bg-red-50">✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {importar && (
        <ImportarRepresentacoes
          tipo="representacoes"
          onClose={() => setImportar(false)}
          onImportado={(msg) => { setAviso(msg); carregar(); }}
        />
      )}

      {modal && (
        <ModalRepresentacao
          item={edit}
          onClose={() => setModal(false)}
          onSave={async (dados) => {
            const r = await saveRepresentacaoAction(edit?.id || null, dados);
            if (r.error) setErro(r.error);
            else { setModal(false); carregar(); }
          }}
        />
      )}
    </div>
  );
}

function ModalRepresentacao({
  item, onClose, onSave,
}: {
  item: RepresentacaoItem | null;
  onClose: () => void;
  onSave: (dados: Record<string, string>) => void;
}) {
  const [form, setForm] = useState({
    nome: item?.nome || "", slug: item?.slug || "", logoUrl: item?.logoUrl || "",
    descricao: item?.descricao || "", segmento: item?.segmento || "", site: item?.site || "",
    emailContato: item?.emailContato || "", telefone: item?.telefone || "",
    responsavel: item?.responsavel || "", status: item?.status || "ativa",
    observacoes: item?.observacoes || "",
  });
  const campo = (k: keyof typeof form) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm({ ...form, [k]: e.target.value }),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900">{item ? "Editar representação" : "Nova representação"}</h3>
          <button onClick={onClose} className="text-slate-400 text-lg">✕</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block text-xs font-semibold text-slate-700">Nome *
            <input required {...campo("nome")} className="input mt-1" placeholder="Ex.: ENGEZER" />
          </label>
          <label className="block text-xs font-semibold text-slate-700">Slug
            <input {...campo("slug")} className="input mt-1" placeholder="engezer (gerado se vazio)" />
          </label>
          <label className="block text-xs font-semibold text-slate-700 sm:col-span-2">URL do logo
            <input {...campo("logoUrl")} className="input mt-1" placeholder="/img/logo-engezer.png" />
          </label>
          <label className="block text-xs font-semibold text-slate-700">Segmento
            <input {...campo("segmento")} className="input mt-1" placeholder="Instrumentação" />
          </label>
          <label className="block text-xs font-semibold text-slate-700">Site
            <input {...campo("site")} className="input mt-1" placeholder="https://..." />
          </label>
          <label className="block text-xs font-semibold text-slate-700 sm:col-span-2">Descrição
            <textarea {...campo("descricao")} rows={2} className="input mt-1" />
          </label>
          <label className="block text-xs font-semibold text-slate-700">E-mail de contato
            <input type="email" {...campo("emailContato")} className="input mt-1" />
          </label>
          <label className="block text-xs font-semibold text-slate-700">Telefone
            <input {...campo("telefone")} className="input mt-1" />
          </label>
          <label className="block text-xs font-semibold text-slate-700">Responsável
            <select {...campo("responsavel")} className="input mt-1">
              <option value="">— selecione —</option>
              <option value="Silvano Xavier">Silvano Xavier</option>
              <option value="Marcio">Marcio</option>
              <option value="Paulo">Paulo</option>
            </select>
          </label>
          <label className="block text-xs font-semibold text-slate-700">Status
            <select {...campo("status")} className="input mt-1">
              <option value="ativa">Ativa</option>
              <option value="inativa">Inativa</option>
            </select>
          </label>
          <label className="block text-xs font-semibold text-slate-700 sm:col-span-2">Observações
            <textarea {...campo("observacoes")} rows={2} className="input mt-1" />
          </label>
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600">Cancelar</button>
          <button onClick={() => onSave(form)} className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white">💾 Salvar</button>
        </div>
      </div>
    </div>
  );
}
