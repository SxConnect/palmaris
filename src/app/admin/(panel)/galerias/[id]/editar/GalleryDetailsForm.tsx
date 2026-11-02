"use client";

import { useActionState } from "react";

import { updateGallery } from "@/lib/actions/galleries";

type Gallery = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
};

/** Dados da galeria (título e descrição). */
export default function GalleryDetailsForm({ gallery }: { gallery: Gallery }) {
  const [state, action, pending] = useActionState(updateGallery, null);

  return (
    <form action={action} className="card space-y-3">
      <input type="hidden" name="id" value={gallery.id} />
      <div>
        <label className="label">Título da galeria</label>
        <input name="title" className="input" defaultValue={gallery.title} required />
      </div>
      <div>
        <label className="label">Descrição (opcional)</label>
        <input name="description" className="input" defaultValue={gallery.description ?? ""} />
      </div>
      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-green-700">{state.success}</p> : null}
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Salvando…" : "Salvar dados"}
      </button>
    </form>
  );
}
