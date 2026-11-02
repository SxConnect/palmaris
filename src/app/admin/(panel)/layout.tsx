import Link from "next/link";

import { requireAdmin } from "@/lib/auth/guard";
import { logoutAction } from "@/lib/auth/actions";

const NAV_ITEMS = [
  { href: "/admin/paginas", label: "Páginas" },
  { href: "/admin/noticias", label: "Notícias" },
  { href: "/admin/galerias", label: "Galerias" },
  { href: "/admin/midias", label: "Mídia" },
  { href: "/admin/mensagens", label: "Mensagens" },
  { href: "/admin/menu", label: "Menu" },
  { href: "/admin/usuarios", label: "Usuários" },
  { href: "/admin/configuracoes", label: "Configurações" },
];

/** Layout do painel administrativo (CMS). */
export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-black tracking-tight text-brand-600">
              PALMARIS CMS
            </Link>
            <nav className="flex flex-wrap gap-4 text-sm">
              {NAV_ITEMS.map((item) => (
                <Link key={item.href} href={item.href} className="text-gray-700 hover:text-brand-700">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/" className="hidden text-gray-500 hover:text-brand-700 sm:inline">
              Ver site
            </Link>
            <span className="hidden text-gray-500 sm:inline">
              {user.email}
              {user.owner ? " (dono)" : ""}
            </span>
            <form action={logoutAction}>
              <button type="submit" className="btn btn-danger text-xs">
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
