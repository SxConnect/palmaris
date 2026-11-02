import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { MenuForm } from "../../MenuForm";

export const dynamic = "force-dynamic";

export default async function EditMenuItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [item, pages, items] = await Promise.all([
    prisma.menuItem.findUnique({ where: { id } }),
    prisma.page.findMany({ where: { published: true }, orderBy: { title: "asc" } }),
    prisma.menuItem.findMany({ orderBy: { menuOrder: "asc" } }),
  ]);
  if (!item) notFound();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Editar item de menu</h1>
        <Link href="/admin/menu" className="text-blue-600 hover:underline">
          ← Voltar
        </Link>
      </div>
      <MenuForm item={item} pages={pages} items={items} />
    </div>
  );
}
