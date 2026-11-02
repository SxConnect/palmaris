import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { deletePost } from "@/lib/actions/posts";

export const dynamic = "force-dynamic";

/** Lista de notícias (artigos) do site. */
export default async function PostsListPage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notícias</h1>
        <Link href="/admin/noticias/nova" className="btn btn-primary">
          Nova notícia
        </Link>
      </div>

      <p className="mb-4 text-sm text-gray-600">
        As notícias publicadas aparecem na seção de notícias e no bloco “Últimas notícias” da
        página inicial.
      </p>

      {posts.length === 0 ? (
        <p className="text-gray-500">Nenhuma notícia publicada.</p>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <div key={post.id} className="card flex items-center justify-between gap-3">
              <div>
                <Link
                  href={`/admin/noticias/${post.id}/editar`}
                  className="font-semibold hover:underline"
                >
                  {post.title}
                </Link>
                {post.category ? (
                  <span className="ml-2 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    {post.category}
                  </span>
                ) : null}
                <span
                  className={`ml-2 rounded px-2 py-0.5 text-xs ${
                    post.published
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {post.published ? "publicada" : "rascunho"}
                </span>
                {!post.showOnHome ? (
                  <span className="ml-2 rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                    fora da home
                  </span>
                ) : null}
                <span className="ml-2 text-xs text-gray-400">
                  {post.createdAt.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/admin/noticias/${post.id}/editar`} className="btn btn-primary text-xs">
                  Editar
                </Link>
                <Link href={`/noticias/${post.slug}`} className="btn text-xs">
                  Ver
                </Link>
                <form action={deletePost.bind(null, post.id)}>
                  <button type="submit" className="btn btn-danger text-xs">
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
