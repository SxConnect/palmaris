"use client";

import { useEffect, useState } from "react";

type MediaItem = {
  id: string;
  filename: string;
  url: string;
  altText: string | null;
};

/**
 * Seletor de várias imagens da biblioteca de mídia.
 * Usado para montar as galerias de fotos.
 */
export default function MediaMultiPicker({
  onSelect,
  label = "Adicionar fotos da biblioteca",
}: {
  onSelect: (mediaId: string) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Recarrega a biblioteca toda vez que o modal abre, para mostrar
  // imagens enviadas recentemente.
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/media")
      .then((res) => res.json())
      .then((data: MediaItem[]) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [open]);

  return (
    <>
      <button type="button" className="btn text-xs" onClick={() => setOpen(true)}>
        {label}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[80vh] w-full max-w-4xl overflow-auto rounded-xl bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Biblioteca de mídia</h3>
              <button type="button" className="btn text-xs" onClick={() => setOpen(false)}>
                Fechar
              </button>
            </div>

            {loading ? (
              <p className="py-8 text-center text-sm text-gray-500">Carregando…</p>
            ) : items.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">
                Nenhuma imagem enviada ainda. Envie em{" "}
                <a href="/admin/midias" className="text-brand-700 underline">
                  Mídia
                </a>
                .
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="overflow-hidden rounded-lg border border-gray-200 transition hover:border-brand-600"
                    onClick={() => {
                      onSelect(item.id);
                      setOpen(false);
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.url}
                      alt={item.altText ?? item.filename}
                      className="h-24 w-full bg-gray-100 object-cover"
                    />
                    <span className="block truncate px-2 py-1 text-left text-[11px] text-gray-500">
                      {item.filename}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <button type="button" className="btn btn-primary text-xs" onClick={() => setOpen(false)}>
                Concluir
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
