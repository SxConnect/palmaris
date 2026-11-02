"use client";

import { useActionState } from "react";

import { uploadMedia } from "@/lib/actions/media";

/** Envio de imagens para a biblioteca de mídia. */
export default function MediaUploader() {
  const [state, action, pending] = useActionState(uploadMedia, null);

  return (
    <form action={action} className="card space-y-3">
      <div>
        <label className="label">Arquivo de imagem</label>
        <input
          name="file"
          type="file"
          accept="image/*"
          className="input"
          required
        />
        <p className="mt-1 text-xs text-gray-500">
          JPG, PNG, WebP ou SVG — até 8 MB. As imagens ficam gravadas no banco de dados.
        </p>
      </div>
      <div>
        <label className="label">Descrição da imagem (opcional)</label>
        <input
          name="altText"
          className="input"
          placeholder="Ex.: Reunião de moradores da ALMZO"
        />
      </div>
      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-green-700">{state.success}</p> : null}
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Enviando…" : "Enviar imagem"}
      </button>
    </form>
  );
}
