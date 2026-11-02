"use client";

import { useCallback, useEffect, useState } from "react";

export type GalleryImageData = {
  id: string;
  url: string;
  caption: string | null;
  alt: string;
};

/**
 * Galeria com lightbox (clique abre a foto em tamanho grande).
 * Recebe as imagens já carregadas pelo servidor.
 */
export default function GalleryLightbox({
  images,
  columns = 3,
}: {
  images: GalleryImageData[];
  columns?: number;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);

  const goTo = useCallback(
    (delta: number) => {
      setOpenIndex((current) => {
        if (current === null) return current;
        const next = current + delta;
        if (next < 0) return images.length - 1;
        if (next >= images.length) return 0;
        return next;
      });
    },
    [images.length],
  );

  // Fechar com ESC e navegar com as setas.
  useEffect(() => {
    if (openIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") goTo(1);
      if (event.key === "ArrowLeft") goTo(-1);
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [openIndex, close, goTo]);

  if (images.length === 0) return null;

  const gridClass =
    columns >= 4
      ? "sm:grid-cols-4"
      : columns === 3
        ? "sm:grid-cols-3"
        : columns === 2
          ? "sm:grid-cols-2"
          : "grid-cols-1";

  return (
    <>
      <div className={`grid grid-cols-2 gap-3 ${gridClass}`}>
        {images.map((image, index) => (
          <figure key={image.id} className="group overflow-hidden rounded-lg bg-neutral-200">
            <button
              type="button"
              onClick={() => setOpenIndex(index)}
              className="block w-full cursor-zoom-in"
              aria-label={`Ampliar foto: ${image.caption ?? image.alt}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={image.alt}
                loading="lazy"
                className="h-40 w-full object-cover transition duration-300 group-hover:scale-105 sm:h-48"
              />
            </button>
            {image.caption ? (
              <figcaption className="px-3 py-2 text-xs text-neutral-600">
                {image.caption}
              </figcaption>
            ) : null}
          </figure>
        ))}
      </div>

      {openIndex !== null ? (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-neutral-950/95 p-4"
          role="dialog"
          aria-modal="true"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Fechar"
            className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[openIndex].url}
            alt={images[openIndex].alt}
            className="max-h-[80vh] max-w-full rounded-lg object-contain"
            onClick={(event) => event.stopPropagation()}
          />

          {images[openIndex].caption ? (
            <p
              className="mt-3 max-w-2xl text-center text-sm text-neutral-300"
              onClick={(event) => event.stopPropagation()}
            >
              {images[openIndex].caption}
            </p>
          ) : null}

          <div
            className="mt-4 flex items-center gap-4"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => goTo(-1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Foto anterior"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm text-neutral-300">
              {openIndex + 1} / {images.length}
            </span>
            <button
              type="button"
              onClick={() => goTo(1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Próxima foto"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
