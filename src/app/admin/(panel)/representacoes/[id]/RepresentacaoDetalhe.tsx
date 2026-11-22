"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getRepresentacaoAction,
  saveProdutoAction,
  deleteProdutoAction,
  updateVinculoAction,
} from "@/lib/actions/representacoes";

type Detalhe = NonNullable<Awaited<ReturnType<typeof getRepresentacaoAction>>>;

export default function RepresentacaoDetalhe({ id }: { id: string }) {
  const [data, setData] = useState<Detalhe | null>(null);
  const [modal, setModal] = useState(false);
  const [editProd, setEditProd] = useState<any>(null);
  const [erro, setErro] = useState("");

  const carregar = async () => setData(await getRepresentacaoAction(id));
  useEffect(() => { carregar(); }, [id]);

  if (!data) return <div className="p-8 text-center text-sm text-slate-400">Carregando...</div>;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-4">
          <Link href="/admin/representacoes" className="text-slate-400 hover:text-slate-700">←</Link>
          {data.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.logoUrl} alt={data.nome} className="h-14 w-auto object-contain" />
          )}
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{data.nome}</h1>
            <p className="text-sm text-slate-500">{data.segmento || "—"}{data.responsavel ? ` · 👤 ${data.responsavel}` : ""}</p>
          </div>
        </div>
        <button onClick={() => { setEditProd(null); setModal(true); }} className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          + Produto/serviço
        </button>
      </div>

      {erro && <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700">{erro}</div>}

      {data.descricao && <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-4">{data.descricao}</p>}

      {/* Produtos */}
      <section>
        <h2 className="text-lg font-bold text-slate-900 mb-3">📦 Produtos e serviços ({data.produtos.length})</h2>
        {data.produtos.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">Nenhum produto cadastrado.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.produtos.map((p) => {
              let fotos: string[] = [];
              try { fotos = JSON.parse(p.imagens || "[]"); } catch {}
              return (
                <div key={p.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                  {fotos.length > 0 ? (
                    <div className="grid grid-cols-3 gap-0.5 h-28">
                      {fotos.slice(0, 6).map((f, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={i} src={f} alt="" className="w-full h-full object-cover" />
                      ))}
                    </div>
                  ) : (
                    <div className="h-20 bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
                      <span className="text-2xl">📦</span>
                    </div>
                  )}
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-sm text-slate-900">{p.nome}</p>
                      {p.destaque && <span className="text-[10px] rounded bg-amber-50 text-amber-700 px-1.5 py-0.5">destaque</span>}
                    </div>
                    {p.categoria && <p className="text-[11px] text-brand-700">{p.categoria}</p>}
                    {p.descricao && <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{p.descricao}</p>}
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => { setEditProd(p); setModal(true); }} className="text-[11px] text-brand-700 hover:underline">Editar</button>
                      <button onClick={async () => {
                        if (!window.confirm("Remover produto?")) return;
                        const r = await deleteProdutoAction(p.id);
                        if ("error" in r) setErro(String(r.error || ""));
                        else carregar();
                      }} className="text-[11px] text-red-600 hover:underline">Excluir</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Clientes */}
      <section>
        <h2 className="text-lg font-bold text-slate-900 mb-3">👥 Clientes desta representação ({data.clientes.length})</h2>
        {data.clientes.length === 0 ? (
          <p className="text-sm text-slate-400">Nenhum cliente vinculado. Adicione na ficha do cliente.</p>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden">
            {data.clientes.map((v) => (
              <div key={v.id} className="p-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{v.cliente.nome}</p>
                  <p className="text-[11px] text-slate-500">{v.cliente.empresa || "—"} · {v.cliente.email || v.cliente.telefone || ""}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    defaultValue={v.status}
                    onChange={async (e) => { await updateVinculoAction(v.id, { status: e.target.value }); carregar(); }}
                    className="rounded border border-slate-200 px-2 py-1 text-[11px]"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="em negociação">Em negociação</option>
                    <option value="pausado">Pausado</option>
                    <option value="perdido">Perdido</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {modal && (
        <ModalProduto
          produto={editProd}
          representacaoId={id}
          onClose={() => setModal(false)}
          onSave={async (dados) => {
            const r = await saveProdutoAction(editProd?.id || null, id, dados);
            if ("error" in r) setErro(String(r.error || ""));
            else { setModal(false); carregar(); }
          }}
        />
      )}
    </div>
  );
}

function ModalProduto({
  produto, representacaoId, onClose, onSave,
}: {
  produto: any; representacaoId: string; onClose: () => void;
  onSave: (dados: any) => void;
}) {
  const [form, setForm] = useState({
    nome: produto?.nome || "", descricao: produto?.descricao || "",
    categoria: produto?.categoria || "", destaque: produto?.destaque || false,
  });
  const [fotos, setFotos] = useState<string[]>(() => {
    try { return JSON.parse(produto?.imagens || "[]"); } catch { return []; }
  });

  const adicionarFotos = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).slice(0, 6 - fotos.length).forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => setFotos((old) => [...old, String(reader.result)].slice(0, 6));
      reader.readAsDataURL(f);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900">{produto ? "Editar produto" : "Novo produto/serviço"}</h3>
          <button onClick={onClose} className="text-slate-400 text-lg">✕</button>
        </div>
        <label className="block text-xs font-semibold text-slate-700">Nome *
          <input required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className="input mt-1" />
        </label>
        <label className="block text-xs font-semibold text-slate-700">Categoria
          <input value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} className="input mt-1" />
        </label>
        <label className="block text-xs font-semibold text-slate-700">Descrição
          <textarea rows={3} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} className="input mt-1" />
        </label>
        <label className="flex items-center gap-2 text-xs text-slate-700">
          <input type="checkbox" checked={form.destaque} onChange={(e) => setForm({ ...form, destaque: e.target.checked })} className="accent-brand-600" />
          Produto em destaque
        </label>

        <div>
          <label className="block text-xs font-semibold text-slate-700">Fotos (até 6, opcional)</label>
          <input type="file" accept="image/*" multiple onChange={(e) => adicionarFotos(e.target.files)} className="mt-1 text-xs w-full" />
          <div className="grid grid-cols-3 gap-2 mt-2">
            {fotos.map((f, i) => (
              <div key={i} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f} alt="" className="w-full h-20 object-cover rounded-lg" />
                <button type="button" onClick={() => setFotos(fotos.filter((_, j) => j !== i))} className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-[10px]">✕</button>
              </div>
            ))}
            {fotos.length < 6 && <div className="h-20 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xl">+</div>}
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600">Cancelar</button>
          <button onClick={() => onSave({ ...form, imagens: fotos })} className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white">💾 Salvar produto</button>
        </div>
      </div>
    </div>
  );
}
