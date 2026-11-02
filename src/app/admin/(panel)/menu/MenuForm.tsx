"use client";

import { useActionState } from "react";
import Link from "next/link";

import { saveMenuItem } from "@/lib/actions/menu";

type Page = { id: string; title: string; slug: string };
type Item = { id: string; label: string };

type MenuItem = {
  id: string;
  label: string;
  url: string | null;
  pageId: string | null;
  parentId: string | null;
  menuOrder: number;
  target: string;
  highlight: boolean;
  visible: boolean;
};

/** Editor de item do menu do site. */
export function MenuForm({
  item,
  pages,
  items,
}: {
  item?: MenuItem;
  pages: Page[];
  items: Item[];
}) {
  const [state, action, pending] = useActionState(saveMenuItem, null);

  return (
    <form action={action} className="card space-y-4">
      {item && <input type="hidden" name="id" value={item.id} />}
      <div>
        <label className="mb-1 block text-sm font-medium">Texto do link</label>
        <input name="label" className="input" defaultValue={item?.label ?? ""} required />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">URL (opcional)</label>
        <input
          name="url"
          className="input"
          defaultValue={item?.url ?? ""}
          placeholder="Ex.: /noticias ou https://..."
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Página vinculada (opcional)</label>
        <select name="pageId" className="input" defaultValue={item?.pageId ?? ""}>
          <option value="">Nenhuma</option>
          {pages.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title} (/p/{p.slug})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Item pai (opcional)</label>
        <select name="parentId" className="input" defaultValue={item?.parentId ?? ""}>
          <option value="">Nenhum (raiz)</option>
          {items
            .filter((i) => i.id !== item?.id)
            .map((i) => (
              <option key={i.id} value={i.id}>
                {i.label}
              </option>
            ))}
        </select>
      </div>
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Ordem</label>
          <input
            name="menuOrder"
            type="number"
            className="input"
            defaultValue={item?.menuOrder ?? 0}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Abertura</label>
          <select name="target" className="input" defaultValue={item?.target ?? "_self"}>
            <option value="_self">Mesma aba</option>
            <option value="_blank">Nova aba</option>
          </select>
        </div>
        <div className="flex items-center gap-2 pb-2">
          <input
            name="highlight"
            type="checkbox"
            id="highlight"
            defaultChecked={item?.highlight ?? false}
          />
          <label htmlFor="highlight" className="text-sm">
            Destacar (botão vermelho em pílula)
          </label>
        </div>
        <div className="flex items-center gap-2 pb-2">
          <input
            name="visible"
            type="checkbox"
            id="visible"
            defaultChecked={item?.visible ?? true}
          />
          <label htmlFor="visible" className="text-sm">
            Visível
          </label>
        </div>
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Salvando..." : "Salvar"}
        </button>
        <Link href="/admin/menu" className="btn">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
