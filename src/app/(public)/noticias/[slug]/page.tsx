import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

import RichContent from "@/components/RichContent";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post) return { title: "Notícia não encontrada" };

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      type: "article",
      publishedTime: post.createdAt.toISOString(),
      images: post.coverImageId ? [`/api/media/${post.coverImageId}`] : undefined,
    },
  };
}

/** Página de uma notícia (artigo). */
export default async function NewsPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
    include: { coverImage: true },
  });

  if (!post || !post.published) notFound();

  return (
    <article className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Link href="/noticias" className="text-sm font-semibold text-brand-600 hover:underline">
          ← Voltar para as notícias
        </Link>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wide text-brand-600">
          {post.category ? <span>{post.category}</span> : null}
          <time dateTime={post.createdAt.toISOString()} className="text-neutral-400">
            {post.createdAt.toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              timeZone: "America/Sao_Paulo",
            })}
          </time>
        </div>

        <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight text-neutral-900 sm:text-4xl">
          {post.title}
        </h1>

        {post.excerpt ? (
          <p className="mt-4 text-lg leading-relaxed text-neutral-600">{post.excerpt}</p>
        ) : null}

        {post.coverImageId ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/media/${post.coverImageId}`}
            alt={post.title}
            className="mt-8 w-full rounded-xl object-cover"
          />
        ) : null}

        <RichContent html={post.content} className="almzo-prose mt-8 text-neutral-700" />

        <div className="mt-12 border-t border-neutral-200 pt-6">
          <Link href="/noticias" className="text-sm font-semibold text-brand-600 hover:underline">
            ← Todas as notícias
          </Link>
        </div>
      </div>
    </article>
  );
}
