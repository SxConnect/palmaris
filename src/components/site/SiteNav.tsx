"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export type NavItem = {
  id: string;
  label: string;
  url: string;
  highlight: boolean;
};

/**
 * Menu principal do site (desktop + mobile).
 * Recebe os itens vindos do CMS (tabela `menu_items`).
 */
export default function SiteNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Fecha o menu mobile ao navegar.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (url: string) => {
    if (!url || url === "/") return pathname === "/";
    return pathname === url || pathname.startsWith(`${url}/`);
  };

  return (
    <>
      {/* Botão do menu mobile */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        aria-expanded={open}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700 transition hover:bg-neutral-100 lg:hidden"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          aria-hidden="true"
        >
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          )}
        </svg>
      </button>

      {/* Navegação desktop */}
      <nav className="hidden items-center gap-7 lg:flex" aria-label="Menu principal">
        {items.map((item) => {
          const active = isActive(item.url);
          const base =
            "text-[15px] font-medium text-slate-700 transition-colors hover:text-brand-600";
          if (item.highlight) {
            return (
              <Link
                key={item.id}
                href={item.url || "#"}
                className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
              >
                <span>{item.label}</span>
                <span aria-hidden="true">→</span>
              </Link>
            );
          }
          return (
            <Link
              key={item.id}
              href={item.url || "#"}
              aria-current={active ? "page" : undefined}
              className={`${base} ${active ? "font-semibold text-brand-600" : ""}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Navegação mobile */}
      {open ? (
        <div className="absolute inset-x-0 top-full z-50 border-b border-neutral-200 bg-white shadow-lg lg:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4" aria-label="Menu mobile">
            {items.map((item) => {
              const active = isActive(item.url);
              if (item.highlight) {
                return (
                  <Link
                    key={item.id}
                    href={item.url || "#"}
                    className="mt-2 rounded-full bg-brand-600 px-5 py-3 text-center text-sm font-bold uppercase tracking-wide text-white"
                  >
                    {item.label}
                  </Link>
                );
              }
              return (
                <Link
                  key={item.id}
                  href={item.url || "#"}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-lg px-3 py-2 text-base font-semibold ${
                    active ? "bg-brand-50 text-brand-700" : "text-neutral-800 hover:bg-neutral-50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      ) : null}
    </>
  );
}
