"use client";

import { useActionState } from "react";
import Link from "next/link";

import { savePost } from "@/lib/actions/posts";
import RichTextEditor from "@/components/RichTextEditor";

type Post = {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  category: string | null;
  published: boolean;
  showOnHome: boolean;
  coverImageId: string | null;
};

/** Formulário de publicação de uma notícia. */
export function PostForm({ post }: { post?: Post }) {
  const [state, action, pending] = useActionState(savePost, null);

  return (
    <form action={action} className="card space-y-4" encType="multipart/form-data">
      {post && <input type="hidden" name="id" value={post.id} />}
      <div>
        <label className="mb-1 block text-sm font-medium">Título</label>
        <input name="title" className="input" defaultValue={post?.title ?? ""} required />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Resumo (aparece nos cards)</label>
        <textarea
          name="excerpt"
          rows={2}
          className="input"
          defaultValue={post?.excerpt ?? ""}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Categoria (opcional)</label>
        <input
          name="category"
          className="input"
          defaultValue={post?.category ?? ""}
          placeholder="Ex.: Assembleia, Projeto, Mobilização"
        />
      </div>
      <RichTextEditor name="content" label="Conteúdo" defaultValue={post?.content ?? ""} />
      <div>
        <label className="mb-1 block text-sm font-medium">Imagem de capa</label>
        {post?.coverImageId && (
          <div className="mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/media/${post.coverImageId}`}
              alt="capa"
              className="h-32 rounded object-cover"
            />
          </div>
        )}
        <input name="cover" type="file" accept="image/*" className="input" />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <input
            name="published"
            type="checkbox"
            id="published"
            defaultChecked={post?.published ?? true}
          />
          <label htmlFor="published" className="text-sm">
            Publicada
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            name="showOnHome"
            type="checkbox"
            id="showOnHome"
            defaultChecked={post?.showOnHome ?? true}
          />
          <label htmlFor="showOnHome" className="text-sm">
            Mostrar na página inicial
          </label>
        </div>
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Salvando..." : "Salvar"}
        </button>
        <Link href="/admin/noticias" className="btn">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
