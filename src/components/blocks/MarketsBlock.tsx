import Link from "next/link";
import type { MarketsData } from "@/lib/blocks";

/**
 * Seção "Mercados de atuação" conforme o mockup da Palmaris:
 * 5 cards de segmentos industriais atendidos com foto e botão de expansão.
 */
export default function MarketsBlock({ data }: { data: MarketsData }) {
  return (
    <section id="mercados" className="relative scroll-mt-20 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {data.title}
          </h2>
          {data.subtitle ? (
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
              {data.subtitle}
            </p>
          ) : null}
        </div>

        {/* Grade de 5 segmentos */}
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {data.items.map((item, index) => (
            <div
              key={index}
              className="group relative flex h-64 flex-col justify-end overflow-hidden rounded-2xl bg-slate-900 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:h-72"
            >
              {/* Imagem de fundo */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl}
                alt={item.title}
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-108"
              />

              {/* Overlay escuro em gradiente para contraste e legibilidade */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              {/* Título e badge na base do card */}
              <div className="relative p-4 sm:p-5">
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-base font-bold leading-tight text-white group-hover:text-sky-300 transition">
                  {item.title}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Botão inferior "Ver todos os mercados" */}
        {data.ctaLabel ? (
          <div className="mt-12 text-center">
            <Link
              href={data.ctaUrl || "#mercados"}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-2xs transition hover:border-brand-500 hover:text-brand-600 hover:bg-slate-50"
            >
              <span>{data.ctaLabel}</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
