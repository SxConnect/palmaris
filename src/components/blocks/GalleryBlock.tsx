import type { GalleryData } from "@/lib/blocks";

import GalleryView from "@/components/site/GalleryView";

/**
 * Bloco "Galeria de fotos": mostra uma galeria criada no painel
 * (Galeria de Fotos) dentro da página.
 */
export default function GalleryBlock({ data }: { data: GalleryData }) {
  if (!data.slug) {
    return (
      <section className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-2xl font-black uppercase tracking-tight text-neutral-900 sm:text-3xl">
            {data.title}
          </h2>
          <p className="mt-4 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 text-sm text-neutral-500">
            Escolha uma galeria no painel (Galeria de Fotos) para exibir as fotos neste bloco.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {data.title ? (
          <h2 className="text-center text-2xl font-black uppercase tracking-tight text-neutral-900 sm:text-3xl">
            {data.title}
          </h2>
        ) : null}
        {data.subtitle ? (
          <p className="mx-auto mt-3 max-w-2xl text-center text-neutral-600">{data.subtitle}</p>
        ) : null}
        <div className="mt-10">
          <GalleryView slug={data.slug} columns={data.columns} caption={data.caption} />
        </div>
      </div>
    </section>
  );
}
