"use client";

import { useEffect, useState } from "react";

type MediaItem = {
  id: string;
  filename: string;
  mimeType: string;
  url: string;
  altText: string | null;
};

/**
 * Campo de imagem com seletor da biblioteca de mídia.
 * Guarda a URL da imagem (`/api/media/<id>`) num input hidden.
 */
export default function MediaPicker({
  name,
  label = "Imagem",
  defaultValue = "",
  onChange,
}: {
  name: string;
  label?: string;
  defaultValue?: string;
  /** Notifica o formulário pai sempre que a imagem muda. */
  onChange?: (value: string) => void;
}) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);

  const update = (next: string) => {
    setValue(next);
    onChange?.(next);
  };

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
    <div>
      <label className="label">{label}</label>
      <input type="hidden" name={name} value={value} />
      <div className="flex items-center gap-3">
        <div className="flex h-20 w-32 items-center justify-center overflow-hidden rounded-lg border border-gray-300 bg-gray-50">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Pré-visualização" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-gray-400">sem imagem</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button type="button" className="btn text-xs" onClick={() => setOpen(true)}>
            Escolher da biblioteca
          </button>
          <input
            type="text"
            className="input text-xs"
            placeholder="ou cole um caminho/URL"
            value={value}
            onChange={(event) => update(event.target.value)}
          />
        </div>
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[80vh] w-full max-w-3xl overflow-auto rounded-xl bg-white p-4">
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
                <a href="/admin/midia" className="text-brand-700 underline">
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
                      update(item.url);
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
          </div>
        </div>
      ) : null}
    </div>
  );
}
