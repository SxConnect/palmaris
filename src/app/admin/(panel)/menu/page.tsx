import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { deleteMenuItem } from "@/lib/actions/menu";

export const dynamic = "force-dynamic";

export default async function MenuListPage() {
  const items = await prisma.menuItem.findMany({
    include: { page: true, parent: true },
    orderBy: { menuOrder: "asc" },
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Menu</h1>
        <Link href="/admin/menu/novo" className="btn btn-primary">
          Novo item
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-gray-500">Nenhum item de menu.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="card flex items-center justify-between">
              <div>
                <Link
                  href={`/admin/menu/${item.id}/editar`}
                  className="font-semibold hover:underline"
                >
                  {item.label}
                </Link>
                {item.parent && (
                  <span className="ml-2 text-xs text-gray-500">
                    (sub de {item.parent.label})
                  </span>
                )}
                <span className="ml-2 text-xs text-gray-400">
                  {item.url || (item.page ? `/p/${item.page.slug}` : "")}
                </span>
              </div>
              <form action={deleteMenuItem.bind(null, item.id)}>
                <button type="submit" className="btn btn-danger text-xs">
                  Excluir
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
