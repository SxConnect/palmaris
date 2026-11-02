"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  addGalleryImage,
  moveGalleryImage,
  removeGalleryImage,
  updateGalleryImage,
} from "@/lib/actions/galleries";

import MediaMultiPicker from "@/components/admin/MediaMultiPicker";

export type GalleryImageItem = {
  id: string;
  url: string;
  caption: string | null;
  filename: string;
};

/**
 * Gerenciador de fotos da galeria: adiciona imagens da biblioteca de mídia,
 * edita legendas, reordena e remove.
 */
export default function GalleryImagesManager({
  galleryId,
  images,
}: {
  galleryId: string;
  images: GalleryImageItem[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [captions, setCaptions] = useState<Record<string, string>>(
    Object.fromEntries(images.map((image) => [image.id, image.caption ?? ""])),
  );

  // Sincroniza as legendas quando a lista de imagens muda (após revalidação).
  // Isso garante que imagens recém-adicionadas apareçam com o campo vazio.
  // (O `images` vem do servidor e muda após `router.refresh()`.)

  const refresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const handleAdd = (mediaId: string) => {
    startTransition(async () => {
      await addGalleryImage(galleryId, mediaId);
      router.refresh();
    });
  };

  const handleRemove = (imageId: string) => {
    startTransition(async () => {
      await removeGalleryImage(galleryId, imageId);
      router.refresh();
    });
  };

  const handleMove = (imageId: string, direction: "up" | "down") => {
    startTransition(async () => {
      await moveGalleryImage(galleryId, imageId, direction);
      router.refresh();
    });
  };

  const handleCaptionBlur = (imageId: string, value: string) => {
    startTransition(async () => {
      await updateGalleryImage(galleryId, imageId, value);
      router.refresh();
    });
  };

  return (
    <div className="card space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Fotos ({images.length})</h2>
        <MediaMultiPicker
          label="+ Adicionar fotos da biblioteca"
          onSelect={handleAdd}
        />
      </div>

      {pending ? <p className="text-xs text-gray-500">Salvando…</p> : null}

      {images.length === 0 ? (
        <p className="text-sm text-gray-500">
          Nenhuma foto nesta galeria. Envie imagens em <strong>Mídia</strong> e adicione aqui.
        </p>
      ) : (
        <ul className="space-y-3">
          {images.map((image, index) => (
            <li
              key={image.id}
              className="flex flex-col gap-3 rounded-lg border border-gray-200 p-3 sm:flex-row sm:items-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={image.caption ?? image.filename}
                className="h-20 w-full rounded object-cover sm:w-32"
              />
              <div className="flex-1">
                <input
                  className="input text-sm"
                  placeholder="Legenda da foto"
                  value={captions[image.id] ?? ""}
                  onChange={(event) =>
                    setCaptions((current) => ({ ...current, [image.id]: event.target.value }))
                  }
                  onBlur={(event) => handleCaptionBlur(image.id, event.target.value)}
                />
                <p className="mt-1 text-[11px] text-gray-400">{image.filename}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  className="btn text-[11px]"
                  disabled={index === 0}
                  onClick={() => handleMove(image.id, "up")}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="btn text-[11px]"
                  disabled={index === images.length - 1}
                  onClick={() => handleMove(image.id, "down")}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="btn btn-danger text-[11px]"
                  onClick={() => handleRemove(image.id)}
                >
                  Remover
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
