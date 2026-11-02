import { prisma } from "@/lib/prisma";
import { deleteMedia } from "@/lib/actions/media";

import MediaUploader from "./MediaUploader";
import CopyUrlButton from "./CopyUrlButton";

export const dynamic = "force-dynamic";

/** Biblioteca de mídia do painel. */
export default async function MediaPage() {
  const media = await prisma.media.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mídia</h1>
        <p className="mt-1 text-sm text-gray-600">
          Envie aqui as imagens usadas na capa, nos projetos e nas notícias. Depois use o
          seletor “Escolher da biblioteca” nos editores.
        </p>
      </div>

      <MediaUploader />

      {media.length === 0 ? (
        <p className="text-gray-500">Nenhuma imagem enviada ainda.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {media.map((item) => (
            <div key={item.id} className="card space-y-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/media/${item.id}`}
                alt={item.altText ?? item.filename}
                className="h-32 w-full rounded object-cover"
              />
              <p className="truncate text-xs text-gray-600" title={item.filename}>
                {item.filename}
              </p>
              <p className="text-[11px] text-gray-400">
                {(item.size / 1024).toFixed(0)} KB
              </p>
              <div className="flex gap-2">
                <CopyUrlButton url={`/api/media/${item.id}`} />
                <form action={deleteMedia.bind(null, item.id)}>
                  <button type="submit" className="btn btn-danger text-[11px]">
                    Excluir
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
