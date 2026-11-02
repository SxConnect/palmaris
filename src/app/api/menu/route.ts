import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.menuItem.findMany({
    include: { page: true },
    orderBy: { menuOrder: "asc" },
  });

  const map = new Map<string, any>();
  items.forEach((i) => {
    map.set(i.id, {
      id: i.id,
      label: i.label,
      url: i.url || (i.page ? `/p/${i.page.slug}` : "#"),
      target: i.target,
      order: i.menuOrder,
      highlight: i.highlight,
      visible: i.visible,
      children: [],
    });
  });

  const roots: any[] = [];
  items.forEach((i) => {
    const node = map.get(i.id)!;
    if (i.parentId && map.has(i.parentId)) {
      map.get(i.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return NextResponse.json(roots);
}
