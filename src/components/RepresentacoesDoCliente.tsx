"use client";

import { useEffect, useState } from "react";
import {
  listRepresentacoesAction,
  listVinculosAction,
  toggleVinculoAction,
  updateVinculoAction,
  type RepresentacaoItem,
} from "@/lib/actions/representacoes";

type Vinculo = {
  id: string; representacaoId: string; nome: string;
  status: string; responsavel: string | null; observacoes: string | null;
};

export default function RepresentacoesDoCliente({ clienteId }: { clienteId: string }) {
  const [reps, setReps] = useState<RepresentacaoItem[]>([]);
  const [vinculos, setVinculos] = useState<Vinculo[]>([]);
  const [erro, setErro] = useState("");

  const carregar = async () => {
    const [todas, vs] = await Promise.all([
      listRepresentacoesAction(),
      listVinculosAction(clienteId),
    ]);
    setReps(todas);
    setVinculos(vs);
  };
  useEffect(() => { carregar(); }, [clienteId]);

  const idsVinculados = new Set(vinculos.map((v) => v.representacaoId));

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <p className="text-xs font-bold text-slate-700 mb-2">🏢 Representações deste cliente</p>
      {erro && <p className="text-[10px] text-red-600 mb-1">{erro}</p>}
      <div className="flex flex-wrap gap-1.5">
        {reps.map((r) => {
          const ativo = idsVinculados.has(r.id);
          return (
            <button
              key={r.id}
              onClick={async () => {
                const res = await toggleVinculoAction(clienteId, r.id);
                if ("error" in res && res.error) setErro(String(res.error));
                else carregar();
              }}
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold border transition ${
                ativo
                  ? "bg-brand-600 text-white border-brand-600"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:border-brand-300"
              }`}
            >
              {ativo ? "✓ " : "+ "}{r.nome}
            </button>
          );
        })}
      </div>
      {vinculos.length > 0 && (
        <div className="mt-2 space-y-1.5 border-t border-slate-100 pt-2">
          {vinculos.map((v) => (
            <div key={v.id} className="flex items-center gap-2 text-[11px]">
              <span className="font-semibold text-slate-700 flex-1">{v.nome}</span>
              <select
                value={v.status}
                onChange={async (e) => {
                  await updateVinculoAction(v.id, { status: e.target.value });
                  carregar();
                }}
                className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px]"
              >
                <option value="ativo">Ativo</option>
                <option value="em negociação">Em negociação</option>
                <option value="pausado">Pausado</option>
                <option value="perdido">Perdido</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
