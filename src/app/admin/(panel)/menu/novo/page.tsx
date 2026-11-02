import { prisma } from "@/lib/prisma";
import { MenuForm } from "../MenuForm";

export const dynamic = "force-dynamic";

export default async function NewMenuItemPage() {
  const [pages, items] = await Promise.all([
    prisma.page.findMany({ where: { published: true }, orderBy: { title: "asc" } }),
    prisma.menuItem.findMany({ orderBy: { menuOrder: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Novo item de menu</h1>
      <MenuForm pages={pages} items={items} />
    </div>
  );
}
