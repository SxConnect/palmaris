import Link from "next/link";

import type { NewsData } from "@/lib/blocks";
import { prisma } from "@/lib/prisma";

/**
 * Bloco "Últimas notícias": lista automaticamente os artigos publicados
 * (mais recentes primeiro). É o que faz o site se comportar como um portal
 * de notícias: o cliente publica pelo painel e o conteúdo aparece na home.
 */
export default async function NewsBlock({ data }: { data: NewsData }) {
  const posts = await prisma.post.findMany({
    where: { published: true, showOnHome: true },
    orderBy: { createdAt: "desc" },
    take: data.limit,
    include: { coverImage: true },
  });

  return (
    <section className="bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center text-2xl font-black uppercase tracking-tight text-neutral-900 sm:text-3xl">
          {data.title}
        </h2>
        {data.subtitle ? (
          <p className="mx-auto mt-3 max-w-2xl text-center text-neutral-600">{data.subtitle}</p>
        ) : null}

        {posts.length === 0 ? (
          <p className="mt-8 text-center text-neutral-500">
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
                    className="h-44 w-full bg-neutral-200 object-cover"
                  />
                ) : null}
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-brand-600">
                    {post.category ? <span>{post.category}</span> : null}
                    <time dateTime={post.createdAt.toISOString()} className="text-neutral-400">
                      {post.createdAt.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}
                    </time>
                  </div>
                  <h3 className="mt-2 text-lg font-bold leading-snug text-neutral-900">
                    <Link href={`/noticias/${post.slug}`} className="hover:text-brand-700">
                      {post.title}
                    </Link>
                  </h3>
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

        {data.ctaLabel && posts.length > 0 ? (
          <div className="mt-10 text-center">
            <Link
              href={data.ctaUrl || "/noticias"}
              className="inline-flex items-center justify-center rounded-full bg-brand-600 px-7 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-brand-700"
            >
              {data.ctaLabel}
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
