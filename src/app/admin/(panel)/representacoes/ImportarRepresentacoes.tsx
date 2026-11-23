"use client";

import { useState } from "react";
import {
  importRepresentacoesAction,
  importProdutosAction,
} from "@/lib/actions/representacoes";

function parseCSV(texto: string): Record<string, string>[] {
  const limpo = texto.replace(/^\uFEFF/, "").trim();
  const linhas = limpo.split(/\r?\n/).filter((l) => l.trim());
  if (linhas.length < 2) return [];
  const cabecalhos = linhas[0].split(",").map((h) => h.trim().toLowerCase());
  return linhas.slice(1).map((linha) => {
    const campos: string[] = [];
    let atual = "", dentroAspas = false;
    for (let i = 0; i < linha.length; i++) {
      const c = linha[i];
      if (c === '"') { dentroAspas = !dentroAspas; continue; }
      if (c === "," && !dentroAspas) { campos.push(atual); atual = ""; continue; }
      atual += c;
    }
    campos.push(atual);
    const obj: Record<string, string> = {};
    cabecalhos.forEach((h, i) => { obj[h] = (campos[i] || "").trim(); });
    return obj;
  });
}

export default function ImportarRepresentacoes({
  tipo,
  onClose,
  onImportado,
}: {
  tipo: "representacoes" | "produtos";
  onClose: () => void;
  onImportado: (msg: string) => void;
}) {
  const [conteudo, setConteudo] = useState("");
  const [erro, setErro] = useState("");
  const [processando, setProcessando] = useState(false);
  const previa = conteudo ? parseCSV(conteudo) : [];

  const importar = async () => {
    if (previa.length === 0) return;
    setProcessando(true);
    const r = tipo === "representacoes"
      ? await importRepresentacoesAction(previa)
      : await importProdutosAction(previa);
    setProcessando(false);
    if (r.error) setErro(r.error);
    else { onImportado(r.success || "Importado."); onClose(); }
  };

  const modelo = tipo === "representacoes" ? "/admin/representacoes/modelo-representacoes" : "/admin/representacoes/modelo-produtos";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900">
              {tipo === "representacoes" ? "📥 Importar representações" : "📥 Importar produtos/serviços"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {tipo === "representacoes"
                ? "Cole o CSV ou envie o arquivo. Uma linha por representação."
                : "Cole o CSV. A coluna 'representacao' deve ter o nome/slug da representação já cadastrada."}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 text-lg">✕</button>
        </div>

        <a href={modelo} className="inline-flex items-center gap-2 rounded-lg border border-brand-300 bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-100">
          ⬇️ Baixar modelo CSV
        </a>

        <textarea
          value={conteudo}
          onChange={(e) => { setConteudo(e.target.value); setErro(""); }}
          rows={8}
          placeholder={tipo === "representacoes"
            ? "nome,slug,descricao,segmento,responsavel,status\nENGEZER,engezer,Equipamentos industriais,Instrumentacao,Silvano Xavier,ativa"
            : "representacao,nome,descricao,categoria,imagens,destaque,ordem\nENGEZER,Caldeira,Caldeira a vapor,Caldeiras,,sim,1"}
          className="input font-mono text-xs"
        />

        {erro && <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700">{erro}</div>}

        {previa.length > 0 && (
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <p className="p-2 bg-slate-50 text-xs font-bold text-slate-700">{previa.length} linha(s) encontrada(s):</p>
            <div className="max-h-40 overflow-y-auto divide-y divide-slate-100">
              {previa.slice(0, 15).map((l, i) => (
                <div key={i} className="p-2 text-[11px] text-slate-600">
                  <strong>{l.nome || "—"}</strong>
                  {l.representacao && <span className="ml-2 rounded bg-brand-50 text-brand-700 px-1.5 py-0.5">🏢 {l.representacao}</span>}
                  {l.categoria && ` · ${l.categoria}`}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 justify-end pt-2">
          <button onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600">Cancelar</button>
          <button onClick={importar} disabled={previa.length === 0 || processando} className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">
            {processando ? "Importando..." : `Importar ${previa.length} linha(s)`}
          </button>
        </div>
      </div>
    </div>
  );
}
