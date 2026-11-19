"use client";

import { useEffect, useState } from "react";
import {
  listPassosAction,
  addPassoRapidoAction,
  togglePassoRapidoAction,
  deletePassoRapidoAction,
  type PassoItem,
} from "@/lib/actions/crm";

const SUGESTOES = [
  "Primeiro contato WhatsApp", "Ligação", "Email enviado",
  "Catálogo enviado", "Pediu orçamento", "Proposta enviada", "Follow-up", "Fechado",
];

export default function FunilCard({
  clienteId,
  passosIniciais,
}: {
  clienteId: string;
  passosIniciais: PassoItem[];
}) {
  const [passos, setPassos] = useState<PassoItem[]>(passosIniciais);
  const [novo, setNovo] = useState("");
  const [mostrarInput, setMostrarInput] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => { setPassos(passosIniciais); }, [passosIniciais]);

  const recarregar = async () => setPassos(await listPassosAction(clienteId));

  const adicionar = async (titulo: string) => {
    if (!titulo.trim()) return;
    const r = await addPassoRapidoAction(clienteId, titulo);
    if (r.error) setErro(r.error);
    else { setNovo(""); setMostrarInput(false); await recarregar(); }
  };

  const toggle = async (id: string) => {
    const r = await togglePassoRapidoAction(id);
    if (r.error) setErro(r.error);
    else await recarregar();
  };

  const excluir = async (id: string) => {
    const r = await deletePassoRapidoAction(id);
    if (r.error) setErro(r.error);
    else await recarregar();
  };

  const feitos = passos.filter((p) => p.concluido).length;
  const progresso = passos.length ? Math.round((feitos / passos.length) * 100) : 0;

  return (
    <div className="rounded-lg bg-white border border-slate-200 p-3">
      <div className="flex items-center justify-between">
        <p className="font-bold text-slate-700">🔻 Funil de vendas</p>
        <span className="text-[10px] rounded-full bg-brand-50 text-brand-700 px-2 py-0.5 font-bold">
          {feitos}/{passos.length} · {progresso}%
        </span>
      </div>

      {/* barra de progresso */}
      <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full bg-brand-600 rounded-full transition-all" style={{ width: `${progresso}%` }} />
      </div>

      {erro && <p className="mt-2 text-[10px] text-red-600">{erro}</p>}

      {/* sugestoes rapidas */}
      <div className="mt-2 flex gap-1 flex-wrap">
        {SUGESTOES.filter((s) => !passos.some((p) => p.titulo === s)).slice(0, 4).map((s) => (
          <button key={s} onClick={() => adicionar(s)} className="rounded-full border border-slate-200 px-2 py-0.5 text-[10px] text-slate-600 hover:bg-brand-50 hover:border-brand-300">
            + {s}
          </button>
        ))}
      </div>

      {/* lista de passos com checkbox */}
      <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
        {passos.length === 0 && <p className="text-[11px] text-slate-400">Nenhum passo. Use as sugestões ou o +.</p>}
        {passos.map((p) => (
          <div key={p.id} className={`flex items-center gap-2 rounded-lg border p-1.5 ${p.concluido ? "bg-green-50/60 border-green-200" : "border-slate-200"}`}>
            <input
              type="checkbox"
              checked={p.concluido}
              onChange={() => toggle(p.id)}
              className="h-3.5 w-3.5 accent-brand-600 shrink-0"
            />
            <span className={`flex-1 text-[11px] truncate ${p.concluido ? "text-slate-500 line-through" : "text-slate-700"}`}>
              {p.titulo}
            </span>
            {p.concluidoEm && <span className="text-[9px] text-slate-400 shrink-0">{new Date(p.concluidoEm).toLocaleDateString("pt-BR")}</span>}
            <button onClick={() => excluir(p.id)} className="text-[11px] text-red-400 hover:text-red-600 shrink-0">✕</button>
          </div>
        ))}
      </div>

      {/* input de novo passo */}
      {mostrarInput ? (
        <form onSubmit={(e) => { e.preventDefault(); adicionar(novo); }} className="mt-2 flex gap-1">
          <input autoFocus value={novo} onChange={(e) => setNovo(e.target.value)} placeholder="Nome do passo" className="input text-[11px] flex-1" />
          <button type="submit" className="rounded-lg bg-brand-600 px-2 text-[11px] text-white">OK</button>
          <button type="button" onClick={() => setMostrarInput(false)} className="text-slate-400 text-xs">✕</button>
        </form>
      ) : (
        <button onClick={() => setMostrarInput(true)} className="mt-2 w-full rounded-lg border border-dashed border-brand-300 py-1.5 text-[11px] font-semibold text-brand-700 hover:bg-brand-50">
          + Adicionar passo ao funil
        </button>
      )}
    </div>
  );
}
