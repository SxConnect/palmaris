"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getRepresentacaoAction,
  saveProdutoAction,
  deleteProdutoAction,
  updateVinculoAction,
  saveRepresentacaoAction,
  saveContatoRepAction,
  deleteContatoRepAction,
} from "@/lib/actions/representacoes";
import ImportarRepresentacoes from "../ImportarRepresentacoes";
import ImageUpload from "@/components/ImageUpload";

type Detalhe = NonNullable<Awaited<ReturnType<typeof getRepresentacaoAction>>>;

export default function RepresentacaoDetalhe({ id }: { id: string }) {
  const [data, setData] = useState<Detalhe | null>(null);
  const [modal, setModal] = useState(false);
  const [editProd, setEditProd] = useState<any>(null);
  const [erro, setErro] = useState("");
  const [importarProd, setImportarProd] = useState(false);
  const [aviso, setAviso] = useState("");
  const [editandoRep, setEditandoRep] = useState(false);
  const [modalContato, setModalContato] = useState(false);
  const [editContato, setEditContato] = useState<any>(null);
  const [logoData, setLogoData] = useState<string>("");

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
        <div className="flex gap-2">
          <button onClick={() => setImportarProd(true)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            📥 Importar CSV
          </button>
          <button onClick={() => { setEditProd(null); setModal(true); }} className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
            + Produto/serviço
          </button>
        </div>
      </div>

      {erro && <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700">{erro}</div>}
      {aviso && <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-xs text-green-700">{aviso}</div>}

      {/* Dados completos da representação */}
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900">📋 Dados da representação</h2>
          <button onClick={() => { setLogoData(""); setEditandoRep(!editandoRep); }} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
            {editandoRep ? "Cancelar" : "✏️ Editar dados"}
          </button>
        </div>
        {editandoRep ? (
          <form onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const dados: Record<string, string> = {};
            fd.forEach((v, k) => { dados[k] = String(v); });
            const r = await saveRepresentacaoAction(data.id, dados);
            if ("error" in r) setErro(String(r.error));
            else { setAviso(r.success || "Salvo."); setEditandoRep(false); carregar(); }
          }} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="text-xs font-semibold text-slate-700">Nome *
              <input name="nome" required defaultValue={data.nome} className="input mt-1" />
            </label>
            <label className="text-xs font-semibold text-slate-700">Razão social
              <input name="razaoSocial" defaultValue={(data as any).razaoSocial || ""} className="input mt-1" />
            </label>
            <label className="text-xs font-semibold text-slate-700 sm:col-span-2">Endereço
              <input name="endereco" defaultValue={(data as any).endereco || ""} className="input mt-1" />
            </label>
            <div className="sm:col-span-2">
              <ImageUpload
                label="Logo da representação"
                value={logoData ? [logoData] : data.logoUrl ? [data.logoUrl] : []}
                onChange={(urls) => setLogoData(urls[0] || "")}
                max={1}
              />
              <input type="hidden" name="logoUrl" value={logoData || data.logoUrl || ""} />
            </div>
            <label className="text-xs font-semibold text-slate-700">Segmento
              <input name="segmento" defaultValue={data.segmento || ""} className="input mt-1" />
            </label>
            <label className="text-xs font-semibold text-slate-700">Site
              <input name="site" defaultValue={data.site || ""} className="input mt-1" />
            </label>
            <label className="text-xs font-semibold text-slate-700">E-mail de contato
              <input name="emailContato" defaultValue={data.emailContato || ""} className="input mt-1" />
            </label>
            <label className="text-xs font-semibold text-slate-700">Telefone
              <input name="telefone" defaultValue={data.telefone || ""} className="input mt-1" />
            </label>
            <label className="text-xs font-semibold text-slate-700">Responsável
              <input name="responsavel" defaultValue={data.responsavel || ""} className="input mt-1" />
            </label>
            <label className="text-xs font-semibold text-slate-700">Status
              <select name="status" defaultValue={data.status} className="input mt-1">
                <option value="ativa">Ativa</option>
                <option value="inativa">Inativa</option>
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-700 sm:col-span-2">Descrição
              <textarea name="descricao" rows={2} defaultValue={data.descricao || ""} className="input mt-1" />
            </label>
            <label className="text-xs font-semibold text-slate-700 sm:col-span-2">Observações
              <textarea name="observacoes" rows={2} defaultValue={data.observacoes || ""} className="input mt-1" />
            </label>
            <div className="sm:col-span-2">
              <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white">💾 Salvar dados</button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div><p className="text-slate-400 font-semibold">Nome</p><p className="text-slate-800">{data.nome}</p></div>
            <div><p className="text-slate-400 font-semibold">Razão social</p><p className="text-slate-800">{(data as any).razaoSocial || "—"}</p></div>
            <div><p className="text-slate-400 font-semibold">Segmento</p><p className="text-slate-800">{data.segmento || "—"}</p></div>
            <div><p className="text-slate-400 font-semibold">Site</p><p className="text-slate-800">{data.site || "—"}</p></div>
            <div><p className="text-slate-400 font-semibold">E-mail</p><p className="text-slate-800">{data.emailContato || "—"}</p></div>
            <div><p className="text-slate-400 font-semibold">Telefone</p><p className="text-slate-800">{data.telefone || "—"}</p></div>
            <div><p className="text-slate-400 font-semibold">Responsável</p><p className="text-slate-800">{data.responsavel || "—"}</p></div>
            <div><p className="text-slate-400 font-semibold">Status</p><p className="text-slate-800">{data.status}</p></div>
            <div className="sm:col-span-3"><p className="text-slate-400 font-semibold">Endereço</p><p className="text-slate-800">{(data as any).endereco || "—"}</p></div>
            {data.descricao && <div className="sm:col-span-3"><p className="text-slate-400 font-semibold">Descrição</p><p className="text-slate-800">{data.descricao}</p></div>}
            {data.observacoes && <div className="sm:col-span-3"><p className="text-slate-400 font-semibold">Observações</p><p className="text-slate-800">{data.observacoes}</p></div>}
          </div>
        )}
      </section>

      {/* Contatos da representação */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-900">👥 Contatos da representação ({data.contatos.length})</h2>
          <button onClick={() => { setEditContato(null); setModalContato(true); }} className="rounded-lg border border-brand-300 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100">
            + Contato
          </button>
        </div>
        {data.contatos.length === 0 ? (
          <p className="text-sm text-slate-400">Nenhum contato cadastrado. Adicione nome, e-mail e telefone de quem atende nesta representação.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.contatos.map((ct: any) => (
              <div key={ct.id} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-sm text-slate-900">
                      {ct.nome}
                      {ct.status === "inativo" && <span className="ml-1 rounded bg-red-50 text-red-700 px-1.5 py-0.5 text-[9px]">INATIVO</span>}
                    </p>
                    {ct.cargo && <p className="text-[11px] text-brand-700">{ct.cargo}</p>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditContato(ct); setModalContato(true); }} className="text-[11px] text-brand-700">Editar</button>
                    <button onClick={async () => {
                      if (!window.confirm("Remover contato?")) return;
                      const r = await deleteContatoRepAction(ct.id);
                      if ("error" in r) setErro(String(r.error)); else carregar();
                    }} className="text-[11px] text-red-600">✕</button>
                  </div>
                </div>
                {ct.email && <p className="text-[11px] text-slate-600 mt-2">✉️ <a href={`mailto:${ct.email}`} className="hover:underline">{ct.email}</a></p>}
                {ct.telefone && <p className="text-[11px] text-slate-600">📞 {ct.telefone}</p>}
                {ct.status === "inativo" && ct.motivoInativo && <p className="text-[10px] text-red-600 mt-1">Motivo: {ct.motivoInativo}</p>}
                {ct.observacoes && <p className="text-[10px] text-slate-400 mt-1">{ct.observacoes}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

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

      {importarProd && (
        <ImportarRepresentacoes
          tipo="produtos"
          onClose={() => setImportarProd(false)}
          onImportado={(msg) => { setAviso(msg); carregar(); }}
        />
      )}

      {modalContato && (
        <ModalContato
          contato={editContato}
          representacaoId={id}
          onClose={() => setModalContato(false)}
          onSave={async (dados) => {
            const r = await saveContatoRepAction(id, editContato?.id || null, dados);
            if ("error" in r) setErro(String(r.error));
            else { setModalContato(false); carregar(); }
          }}
        />
      )}

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

function ModalContato({
  contato, representacaoId, onClose, onSave,
}: {
  contato: any; representacaoId: string; onClose: () => void;
  onSave: (dados: any) => void;
}) {
  const [form, setForm] = useState({
    nome: contato?.nome || "", cargo: contato?.cargo || "",
    email: contato?.email || "", telefone: contato?.telefone || "",
    observacoes: contato?.observacoes || "",
    status: contato?.status || "ativo",
    motivoInativo: contato?.motivoInativo || "",
  });
  const campo = (k: keyof typeof form) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value }),
  });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900">{contato ? "Editar contato" : "Novo contato"}</h3>
          <button onClick={onClose} className="text-slate-400 text-lg">✕</button>
        </div>
        <label className="block text-xs font-semibold text-slate-700">Nome *
          <input required {...campo("nome")} className="input mt-1" />
        </label>
        <label className="block text-xs font-semibold text-slate-700">Cargo
          <input {...campo("cargo")} className="input mt-1" placeholder="Ex.: Gerente de Vendas" />
        </label>
        <label className="block text-xs font-semibold text-slate-700">E-mail
          <input type="email" {...campo("email")} className="input mt-1" />
        </label>
        <label className="block text-xs font-semibold text-slate-700">Telefone
          <input {...campo("telefone")} className="input mt-1" />
        </label>
        <label className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-xs">
          <span className="font-semibold text-slate-700">Contato ativo</span>
          <input type="checkbox" checked={form.status !== "inativo"} onChange={(e) => setForm({ ...form, status: e.target.checked ? "ativo" : "inativo" })} className="accent-green-600 h-4 w-4" />
        </label>
        {form.status === "inativo" && (
          <label className="block text-xs font-semibold text-slate-700">Motivo da inatividade
            <input {...campo("motivoInativo")} placeholder="Ex.: não responde, saiu da empresa..." className="input mt-1" />
          </label>
        )}
        <label className="block text-xs font-semibold text-slate-700">Observações
          <textarea rows={2} {...campo("observacoes")} className="input mt-1" />
        </label>
        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600">Cancelar</button>
          <button onClick={() => onSave(form)} className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white">💾 Salvar contato</button>
        </div>
      </div>
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

        <ImageUpload
          label="Fotos do produto (até 6, opcional)"
          value={fotos}
          onChange={setFotos}
          max={6}
        />

        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600">Cancelar</button>
          <button onClick={() => onSave({ ...form, imagens: fotos })} className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white">💾 Salvar produto</button>
        </div>
      </div>
    </div>
  );
}
