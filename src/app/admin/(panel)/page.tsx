import Link from "next/link";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** Painel inicial do CMS: resumo e atalhos. */
export default async function AdminDashboard() {
  const [posts, pages, sections, media] = await Promise.all([
    prisma.post.count(),
    prisma.page.count(),
    prisma.section.count(),
    prisma.media.count(),
  ]);

  const cards = [
    { label: "Notícias", value: posts, href: "/admin/noticias" },
    { label: "Páginas", value: pages, href: "/admin/paginas" },
    { label: "Blocos", value: sections, href: "/admin/paginas" },
    { label: "Imagens", value: media, href: "/admin/midias" },
  ];

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">Painel do site</h1>
      <p className="mb-6 text-sm text-gray-600">
        Publique conteúdos, gerencie as soluções e mantenha os dados da Palmaris Representações atualizados.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="card">
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="text-3xl font-bold">{card.value}</p>
            <Link href={card.href} className="mt-2 inline-block text-brand-700 hover:underline">
              Gerenciar →
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="card">
          <h2 className="text-lg font-semibold">Publicar uma notícia</h2>
          <p className="mt-1 text-sm text-gray-600">
            Escreva um artigo, envie a imagem de capa e publique. Ele aparece na home e na
            seção de notícias.
          </p>
          <Link href="/admin/noticias/nova" className="btn btn-primary mt-4 text-sm">
            Nova notícia
          </Link>
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold">Editar a página inicial</h2>
          <p className="mt-1 text-sm text-gray-600">
            A home é formada por blocos (capa, quem somos, projetos, notícias). Cada bloco
            tem seu próprio editor.
          </p>
          <Link href="/admin/paginas" className="btn btn-primary mt-4 text-sm">
            Abrir páginas
          </Link>
        </div>
      </div>
    </div>
  );
}
