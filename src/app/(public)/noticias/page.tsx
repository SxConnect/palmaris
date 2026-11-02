import type { Metadata } from "next";
import Link from "next/link";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Notícias",
  description: "Acompanhe as Assembleias, lutas e conquistas da ALMZO.",
};

/** Lista de notícias (artigos) publicados no painel. */
export default async function NewsListPage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    include: { coverImage: true },
  });

  return (
    <div className="bg-neutral-100 py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h1 className="text-3xl font-black uppercase tracking-tight text-neutral-900 sm:text-4xl">
          Notícias
        </h1>
        <p className="mt-3 max-w-2xl text-neutral-600">
          Assembleias, projetos e conquistas da Associação de Luta por Moradia da Zona Oeste.
        </p>

        {posts.length === 0 ? (
          <p className="mt-10 rounded-xl bg-white p-8 text-center text-neutral-500 ring-1 ring-neutral-200">
            Nenhuma notícia publicada até o momento.
          </p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-neutral-200 transition hover:shadow-md"
              >
                {post.coverImageId ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/media/${post.coverImageId}`}
                    alt={post.title}
                    className="h-48 w-full bg-neutral-200 object-cover"
                  />
                ) : null}
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-brand-600">
                    {post.category ? <span>{post.category}</span> : null}
                    <time
                      dateTime={post.createdAt.toISOString()}
                      className="text-neutral-400"
                    >
                      {post.createdAt.toLocaleDateString("pt-BR", {
                        timeZone: "America/Sao_Paulo",
                      })}
                    </time>
                  </div>
                  <h2 className="mt-2 text-lg font-bold leading-snug text-neutral-900">
                    <Link href={`/noticias/${post.slug}`} className="hover:text-brand-700">
                      {post.title}
                    </Link>
                  </h2>
                  {post.excerpt ? (
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-neutral-600">
                      {post.excerpt}
                    </p>
                  ) : null}
                  <Link
                    href={`/noticias/${post.slug}`}
                    className="mt-4 text-sm font-bold uppercase tracking-wide text-brand-600 hover:text-brand-700"
                  >
                    Ler mais →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
