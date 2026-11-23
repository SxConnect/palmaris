"use client";

import { useEffect, useState } from "react";
import { salvarDadosClienteAction } from "@/lib/actions/crm";

type Cliente = {
  id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  empresa: string | null;
  cnpj: string | null;
  indicadoPorNome: string | null;
  status?: string | null;
  motivoInativo?: string | null;
};

export default function DadosClienteCard({
  cliente,
  onSalvo,
}: {
  cliente: Cliente;
  onSalvo: () => void;
}) {
  const [editando, setEditando] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    nome: cliente.nome || "",
    empresa: cliente.empresa || "",
    cargo: "",
    telefone: cliente.telefone || "",
    email: cliente.email || "",
    cnpj: cliente.cnpj || "",
    indicadoPorNome: cliente.indicadoPorNome || "",
    notas: "",
    status: cliente.status || "ativo",
    motivoInativo: cliente.motivoInativo || "",
  });

  useEffect(() => {
    setForm({
      nome: cliente.nome || "",
      empresa: cliente.empresa || "",
      cargo: "",
      telefone: cliente.telefone || "",
      email: cliente.email || "",
      cnpj: cliente.cnpj || "",
      indicadoPorNome: cliente.indicadoPorNome || "",
      notas: "",
      status: cliente.status || "ativo",
      motivoInativo: cliente.motivoInativo || "",
    });
  }, [cliente]);

  const campo = (k: keyof typeof form) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value }),
  });

  const salvar = async () => {
    const r = await salvarDadosClienteAction(cliente.id, form);
    if (r.error) setMsg(r.error);
    else { setMsg("✅ Dados salvos."); setEditando(false); onSalvo(); setTimeout(() => setMsg(""), 2500); }
  };

  return (
    <div className="rounded-lg bg-white border border-slate-200 p-2">
      <div className="flex items-center justify-between">
        <p className="font-bold text-slate-700">📇 Dados do cliente</p>
        <button
          onClick={() => (editando ? salvar() : setEditando(true))}
          className="text-[10px] rounded border border-brand-300 bg-brand-50 px-2 py-0.5 font-semibold text-brand-700"
        >
          {editando ? "💾 Salvar" : "✏️ Editar"}
        </button>
      </div>
      {msg && <p className="mt-1 text-[10px] text-green-700">{msg}</p>}

      {editando ? (
        <div className="mt-2 space-y-1.5">
          <label className="block text-[10px] text-slate-500">Nome *
            <input {...campo("nome")} className="w-full rounded border border-slate-200 px-1.5 py-1 text-[11px]" />
          </label>
          <label className="block text-[10px] text-slate-500">Empresa
            <input {...campo("empresa")} className="w-full rounded border border-slate-200 px-1.5 py-1 text-[11px]" />
          </label>
          <label className="block text-[10px] text-slate-500">Telefone
            <input {...campo("telefone")} placeholder="+55 21 97274-2954" className="w-full rounded border border-slate-200 px-1.5 py-1 text-[11px]" />
          </label>
          <label className="block text-[10px] text-slate-500">E-mail
            <input type="email" {...campo("email")} className="w-full rounded border border-slate-200 px-1.5 py-1 text-[11px]" />
          </label>
          <label className="block text-[10px] text-slate-500">CNPJ
            <input {...campo("cnpj")} placeholder="00.000.000/0001-00" className="w-full rounded border border-slate-200 px-1.5 py-1 text-[11px]" />
          </label>
          <label className="block text-[10px] text-slate-500">Quem indicou (nome livre)
            <input {...campo("indicadoPorNome")} placeholder="Ex.: João da ACME" className="w-full rounded border border-slate-200 px-1.5 py-1 text-[11px]" />
          </label>
          <label className="flex items-center justify-between rounded border border-slate-200 px-2 py-1.5 text-[11px]">
            <span className="font-semibold text-slate-700">Cliente ativo</span>
            <input type="checkbox" checked={form.status !== "inativo"} onChange={(e) => setForm({ ...form, status: e.target.checked ? "ativo" : "inativo" })} className="accent-green-600 h-4 w-4" />
          </label>
          {form.status === "inativo" && (
            <label className="block text-[10px] text-slate-500">Motivo da inatividade
              <input {...campo("motivoInativo")} placeholder="Ex.: sem resposta, migrou para concorrência..." className="w-full rounded border border-slate-200 px-1.5 py-1 text-[11px]" />
            </label>
          )}
          <button onClick={salvar} className="w-full rounded-lg bg-brand-600 px-2 py-1.5 text-[11px] font-semibold text-white">💾 Salvar dados</button>
        </div>
      ) : (
        <div className="mt-1 space-y-0.5 text-[11px]">
          <p className="font-semibold text-slate-700">
            {cliente.nome}
            {cliente.status === "inativo" && <span className="ml-1 rounded bg-red-50 text-red-700 px-1.5 py-0.5 text-[9px]">INATIVO</span>}
          </p>
          {cliente.status === "inativo" && cliente.motivoInativo && <p className="text-[10px] text-red-600">Motivo: {cliente.motivoInativo}</p>}
          <p className="text-slate-500">{cliente.telefone || "—"}</p>
          {cliente.email && <p className="text-slate-500 truncate">{cliente.email}</p>}
          {cliente.empresa && <p className="text-slate-500">{cliente.empresa}</p>}
          {cliente.cnpj && <p className="text-slate-500">CNPJ: {cliente.cnpj}</p>}
          {cliente.indicadoPorNome && <p className="text-brand-700">👤 Indicado por: {cliente.indicadoPorNome}</p>}
        </div>
      )}
    </div>
  );
}
