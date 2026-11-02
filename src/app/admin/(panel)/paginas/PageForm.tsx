"use client";

import { useActionState } from "react";
import Link from "next/link";

import { savePage } from "@/lib/actions/pages";
import RichTextEditor from "@/components/RichTextEditor";

type Page = {
  id: string;
  title: string;
  content: string;
  published: boolean;
  showInMenu: boolean;
  menuOrder: number;
};

export function PageForm({ page }: { page?: Page }) {
  const [state, action, pending] = useActionState(savePage, null);

  return (
    <form action={action} className="card space-y-4">
      {page && <input type="hidden" name="id" value={page.id} />}
      <div>
        <label className="mb-1 block text-sm font-medium">Título</label>
        <input name="title" className="input" defaultValue={page?.title ?? ""} required />
      </div>
      <RichTextEditor name="content" label="Conteúdo" defaultValue={page?.content ?? ""} />
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <input name="published" type="checkbox" id="published" defaultChecked={page?.published ?? true} />
          <label htmlFor="published" className="text-sm">
            Publicado
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input name="showInMenu" type="checkbox" id="showInMenu" defaultChecked={page?.showInMenu ?? false} />
          <label htmlFor="showInMenu" className="text-sm">
            Mostrar no menu
          </label>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Ordem do menu</label>
          <input name="menuOrder" type="number" className="input" defaultValue={page?.menuOrder ?? 0} />
        </div>
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Salvando..." : "Salvar"}
        </button>
        <Link href="/admin/paginas" className="btn">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
