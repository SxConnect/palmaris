"use client";

import { useState } from "react";
import { importClientesAction } from "@/lib/actions/crm";

function parseCSV(texto: string): Record<string, string>[] {
  // Remove BOM
  const limpo = texto.replace(/^\uFEFF/, "").trim();
  const linhas = limpo.split(/\r?\n/).filter((l) => l.trim());
  if (linhas.length < 2) return [];
  const cabecalhos = linhas[0].split(",").map((h) => h.trim().toLowerCase());
  return linhas.slice(1).map((linha) => {
    const campos = linha.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    const obj: Record<string, string> = {};
    cabecalhos.forEach((h, i) => { obj[h] = campos[i] || ""; });
    return obj;
  });
}

export default function ImportarCsv({
  onClose,
  onImportado,
}: {
  onClose: () => void;
  onImportado: (msg: string) => void;
}) {
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [colado, setColado] = useState("");
  const [erro, setErro] = useState("");
  const [processando, setProcessando] = useState(false);
  const [previa, setPrevia] = useState<Record<string, string>[] | null>(null);

  const processar = (conteudo: string) => {
    const linhas = parseCSV(conteudo);
    setPrevia(linhas);
    if (linhas.length === 0) setErro("Nenhum cliente encontrado. Verifique o CSV.");
    else setErro("");
  };

  const aoSelecionar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setArquivo(f);
    processar(await f.text());
  };

  const importar = async () => {
    if (!previa || previa.length === 0) return;
    setProcessando(true);
    const r = await importClientesAction(previa);
    setProcessando(false);
    if (r.error) setErro(r.error);
    else {
      onImportado(r.success || "Importado.");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900">📥 Importar clientes (CSV)</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Envie um arquivo .csv ou cole o conteúdo. Colunas: nome, empresa, cargo, telefone, email, emailExtra, origem, tags, notas.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 text-lg">✕</button>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <label className="cursor-pointer rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
            📁 Escolher arquivo .csv
            <input type="file" accept=".csv,text/csv" onChange={aoSelecionar} className="hidden" />
          </label>
          {arquivo && <span className="text-xs text-slate-500">{arquivo.name}</span>}
          <a
            href="/admin/clientes/modelo-csv"
            className="rounded-lg border border-brand-300 bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-100"
          >
            ⬇️ Baixar modelo CSV
          </a>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Ou cole o conteúdo do CSV:</label>
          <textarea
            value={colado}
            onChange={(e) => { setColado(e.target.value); processar(e.target.value); }}
            rows={6}
            placeholder="nome,empresa,cargo,telefone,email,origem,tags,notas,representacao&#10;João Silva,ACME,Gerente,5521999999999,joao@acme.com.br,visita,cliente,Contato da visita,ENGEZER"
            className="input font-mono text-xs"
          />
        </div>

        {erro && <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700">{erro}</div>}

        {previa && previa.length > 0 && (
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <p className="p-2 bg-slate-50 text-xs font-bold text-slate-700">{previa.length} cliente(s) encontrado(s):</p>
            <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
              {previa.slice(0, 20).map((l, i) => (
                <div key={i} className="p-2 text-[11px] text-slate-600">
                  <strong>{l.nome || "(sem nome)"}</strong>
                  {l.empresa && ` · ${l.empresa}`}
                  {l.telefone && ` · ${l.telefone}`}
                  {l.email && ` · ${l.email}`}
                  {l.representacao && <span className="ml-1 rounded bg-brand-50 text-brand-700 px-1.5 py-0.5">🏢 {l.representacao}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600">Cancelar</button>
          <button
            onClick={importar}
            disabled={!previa || previa.length === 0 || processando}
            className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            {processando ? "Importando..." : `Importar ${previa?.length || 0} cliente(s)`}
          </button>
        </div>
      </div>
    </div>
  );
}
