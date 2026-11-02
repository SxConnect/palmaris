"use client";

import { useEffect, useRef, useState } from "react";

import { convertYouTubeLinks } from "@/lib/youtube";

type GalleryOption = {
  id: string;
  title: string;
  slug: string;
  count: number;
};

/**
 * Editor de texto do painel.
 *
 * Duas modalities: "Visualizar" (prévia do HTML, já com vídeos embutidos) e
 * "HTML" (edição direta). Os botões "Galeria" e "YouTube" inserem os
 * shortcodes correspondentes no texto.
 */
export default function RichTextEditor({
  name,
  label,
  defaultValue = "",
}: {
  name: string;
  label: string;
  defaultValue?: string;
}) {
  const [mode, setMode] = useState<"preview" | "html">("preview");
  const [html, setHtml] = useState(defaultValue);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleries, setGalleries] = useState<GalleryOption[]>([]);
  const [youtubeOpen, setYoutubeOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Carrega a lista de galerias quando o menu é aberto.
  useEffect(() => {
    if (!galleryOpen || galleries.length > 0) return;
    fetch("/api/galleries")
      .then((res) => res.json())
      .then((data: GalleryOption[]) => setGalleries(Array.isArray(data) ? data : []))
      .catch(() => setGalleries([]));
  }, [galleryOpen, galleries.length]);

  /** Insere um trecho de HTML na posição do cursor. */
  const insertAtCursor = (snippet: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setHtml((current) => `${current}${snippet}`);
      return;
    }

    const start = textarea.selectionStart ?? html.length;
    const end = textarea.selectionEnd ?? html.length;
    const next = `${html.slice(0, start)}${snippet}${html.slice(end)}`;
    setHtml(next);

    requestAnimationFrame(() => {
      textarea.focus();
      const position = start + snippet.length;
      textarea.setSelectionRange(position, position);
    });
  };

  const insertGallery = (slug: string) => {
    insertAtCursor(`<p>[galeria slug="${slug}"]</p>`);
    setGalleryOpen(false);
    setMode("html");
  };

  const insertYouTube = () => {
    const url = youtubeUrl.trim();
    if (!url) return;
    insertAtCursor(`<p>[youtube url="${url}"]</p>`);
    setYoutubeOpen(false);
    setYoutubeUrl("");
    setMode("html");
  };

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <label className="block text-sm font-medium">{label}</label>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => setGalleryOpen((value) => !value)}
            className="rounded border border-gray-300 px-2 py-1 hover:bg-gray-100"
          >
            Galeria
          </button>
          <button
            type="button"
            onClick={() => setYoutubeOpen((value) => !value)}
            className="rounded border border-gray-300 px-2 py-1 hover:bg-gray-100"
          >
            YouTube
          </button>
          <button
            type="button"
            onClick={() => setMode("preview")}
            className={`rounded px-2 py-1 ${mode === "preview" ? "bg-brand-600 text-white" : "bg-gray-200"}`}
          >
            Visualizar
          </button>
          <button
            type="button"
            onClick={() => setMode("html")}
            className={`rounded px-2 py-1 ${mode === "html" ? "bg-brand-600 text-white" : "bg-gray-200"}`}
          >
            HTML
          </button>
        </div>
      </div>

      {galleryOpen ? (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
          <p className="mb-2 text-xs text-gray-600">
            Escolha uma galeria para inserir o shortcode no texto:
          </p>
          {galleries.length === 0 ? (
            <p className="text-xs text-gray-500">
              Nenhuma galeria criada ainda. Crie em{" "}
              <a href="/admin/galerias" className="text-brand-700 underline">
                Galerias de fotos
              </a>
              .
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {galleries.map((gallery) => (
                <button
                  key={gallery.id}
                  type="button"
                  onClick={() => insertGallery(gallery.slug)}
                  className="rounded border border-gray-300 bg-white px-2 py-1 text-xs hover:border-brand-600"
                >
                  {gallery.title} ({gallery.count})
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {youtubeOpen ? (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
          <p className="mb-2 text-xs text-gray-600">
            Cole o link do YouTube (watch, youtu.be, shorts ou embed):
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              className="input text-xs"
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(event) => setYoutubeUrl(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  insertYouTube();
                }
              }}
            />
            <button
              type="button"
              onClick={insertYouTube}
              className="btn btn-primary text-xs"
              disabled={!youtubeUrl.trim()}
            >
              Inserir
            </button>
          </div>
          <p className="mt-2 text-[11px] text-gray-500">
            Dica: você também pode apenas colar o link do YouTube no texto — ele vira
            vídeo automaticamente na página publicada.
          </p>
        </div>
      ) : null}

      {mode === "preview" ? (
        <iframe
          srcDoc={convertYouTubeLinks(html)}
          className="min-h-[400px] w-full rounded border border-gray-300 bg-white"
          sandbox="allow-same-origin"
          title="Preview"
        />
      ) : (
        <textarea
          ref={textareaRef}
          className="input font-mono text-sm"
          rows={18}
          value={html}
          onChange={(e) => setHtml(e.target.value)}
        />
      )}

      <input type="hidden" name={name} value={html} />
    </div>
  );
}
