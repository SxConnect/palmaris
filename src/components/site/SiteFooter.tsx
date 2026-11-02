import Link from "next/link";
import SocialLinks from "@/components/site/SocialLinks";
import { getSiteSettings } from "@/lib/site-settings";

/**
 * Rodapé institucional da Palmaris Representações:
 * Logo, chamada de apoio, links rápidos, informações de contato e redes sociais.
 */
export default async function SiteFooter() {
  const settings = await getSiteSettings();

  return (
    <footer className="bg-[#050e1d] text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12">
          {/* Coluna 1: Logo e resumo */}
          <div className="space-y-4 lg:col-span-5">
            <Link href="/" className="inline-block" aria-label="Palmaris Representações">
              {settings.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={settings.logoUrl}
                  alt={settings.siteName}
                  className="h-14 w-auto rounded-md bg-white/95 p-1.5 object-contain"
                />
              ) : (
                <span className="text-2xl font-black tracking-wider text-white">
                  PALMARIS
                </span>
              )}
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-slate-400">
              {settings.tagline || "Conectamos indústria, tecnologia e soluções."}
            </p>
            <div className="pt-2">
              <SocialLinks variant="footer" />
            </div>
          </div>

          {/* Coluna 2: Contato */}
          <div className="space-y-3 lg:col-span-4">
            <h3 className="text-base font-bold text-white">Contato</h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              {settings.phone ? (
                <li className="flex items-center gap-2.5">
                  <svg className="h-4 w-4 shrink-0 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href={`tel:${settings.phone.replace(/\D/g, "")}`} className="hover:text-white transition">
                    {settings.phone}
                  </a>
                </li>
              ) : null}
              {settings.email ? (
                <li className="flex items-center gap-2.5">
                  <svg className="h-4 w-4 shrink-0 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href={`mailto:${settings.email}`} className="hover:text-white transition">
                    {settings.email}
                  </a>
                </li>
              ) : null}
              {settings.address ? (
                <li className="flex items-start gap-2.5">
                  <svg className="h-4 w-4 shrink-0 text-brand-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{settings.address}</span>
                </li>
              ) : null}
            </ul>
          </div>

          {/* Coluna 3: Links úteis */}
          <div className="space-y-3 lg:col-span-3">
            <h3 className="text-base font-bold text-white">Links úteis</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="#solucoes" className="hover:text-white transition flex items-center gap-1.5">
                  <span className="text-brand-400 text-xs">→</span> Soluções
                </Link>
              </li>
              <li>
                <Link href="#mercados" className="hover:text-white transition flex items-center gap-1.5">
                  <span className="text-brand-400 text-xs">→</span> Mercados
                </Link>
              </li>
              <li>
                <Link href="#parceiros" className="hover:text-white transition flex items-center gap-1.5">
                  <span className="text-brand-400 text-xs">→</span> Parceiros
                </Link>
              </li>
              <li>
                <Link href="#sobre" className="hover:text-white transition flex items-center gap-1.5">
                  <span className="text-brand-400 text-xs">→</span> Sobre a Palmaris
                </Link>
              </li>
              <li>
                <Link href="/p/contato" className="hover:text-white transition flex items-center gap-1.5">
                  <span className="text-brand-400 text-xs">→</span> Contato
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800/80 pt-8 text-xs text-slate-400 sm:flex-row">
          <p>© {new Date().getFullYear()} Palmaris Representações. Todos os direitos reservados.</p>
          <p className="flex items-center gap-1 text-slate-400">
            Conectamos indústria, tecnologia e soluções.
          </p>
        </div>
      </div>
    </footer>
  );
}
