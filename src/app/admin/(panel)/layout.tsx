import Link from "next/link";

import { requireAuth } from "@/lib/auth/guard";
import { logoutAction } from "@/lib/auth/actions";

const ADMIN_NAV_ITEMS = [
  { href: "/admin/email", label: "Webmail" },
  { href: "/admin/campanhas", label: "Campanhas" },
  { href: "/admin/paginas", label: "Páginas" },
  { href: "/admin/noticias", label: "Notícias" },
  { href: "/admin/galerias", label: "Galerias" },
  { href: "/admin/midias", label: "Mídia" },
  { href: "/admin/mensagens", label: "Mensagens" },
  { href: "/admin/menu", label: "Menu" },
  { href: "/admin/usuarios", label: "Usuários" },
  { href: "/admin/configuracoes", label: "Configurações" },
];

const USER_NAV_ITEMS = [
  { href: "/admin/email", label: "Webmail" },
];

/** Layout do painel administrativo (CMS) e Webmail. */
export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();
  const isAdmin = user.role === "ADMIN" || user.owner;
  const navItems = isAdmin ? ADMIN_NAV_ITEMS : USER_NAV_ITEMS;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="border-b bg-white sticky top-0 z-30 shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href={isAdmin ? "/admin" : "/admin/email"} className="flex items-center gap-2 font-black tracking-tight text-brand-600">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/img/logo-palmaris.jpg" alt="Palmaris" className="h-7 w-auto object-contain" />
              <span className="hidden sm:inline text-slate-900 font-extrabold text-sm">PALMARIS</span>
            </Link>
            <nav className="flex flex-wrap items-center gap-1 sm:gap-2 text-sm">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-2.5 py-1.5 text-slate-700 font-medium transition hover:bg-slate-100 hover:text-brand-600"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            {isAdmin ? (
              <Link href="/" target="_blank" className="hidden text-slate-500 hover:text-brand-700 sm:inline text-xs">
                Ver site ↗
              </Link>
            ) : null}
            <span className="hidden text-slate-600 sm:inline text-xs font-semibold bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              {user.email} {user.owner ? "★ Super Admin" : ""}
            </span>
            <form action={logoutAction}>
              <button type="submit" className="btn btn-danger text-xs py-1 px-2.5">
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 flex-1 w-full">{children}</main>
    </div>
  );
}
