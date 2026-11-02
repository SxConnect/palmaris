"use client";

import { useActionState } from "react";

import { createGallery } from "@/lib/actions/galleries";

/** Formulário de criação de galeria de fotos. */
export default function GalleryCreateForm() {
  const [state, action, pending] = useActionState(createGallery, null);

  return (
    <form action={action} className="card space-y-3">
      <div>
        <label className="label">Título da galeria</label>
        <input
          name="title"
          className="input"
          placeholder="Ex.: Assembleia de junho de 2025"
          required
        />
      </div>
      <div>
        <label className="label">Descrição (opcional)</label>
        <input name="description" className="input" />
      </div>
      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Criando…" : "Criar galeria"}
      </button>
    </form>
  );
}
