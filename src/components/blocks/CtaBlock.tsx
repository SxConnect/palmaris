import Link from "next/link";
import type { CtaData } from "@/lib/blocks";

/**
 * Faixa de Chamada para Ação (CTA) da Palmaris Representações conforme o mockup:
 * "VAMOS CONVERSAR? Sua operação mais eficiente começa com o parceiro certo."
 */
export default function CtaBlock({ data }: { data: CtaData }) {
  return (
    <section className="bg-slate-900 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#071731] via-[#0b244d] to-[#081e42] p-8 shadow-2xl sm:p-12 lg:flex lg:items-center lg:justify-between lg:p-14">
          {/* Luz sutil de fundo */}
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand-500/15 blur-2xl"
            aria-hidden="true"
          />

          <div className="max-w-2xl">
            {data.eyebrow ? (
              <span className="inline-block text-xs font-bold tracking-widest text-sky-400 uppercase">
                {data.eyebrow}
              </span>
            ) : (
              <span className="inline-block text-xs font-bold tracking-widest text-sky-400 uppercase">
                VAMOS CONVERSAR?
              </span>
            )}
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
              {data.title}
            </h2>
            {data.text ? (
              <p className="mt-4 text-base leading-relaxed text-slate-300">
                {data.text}
              </p>
            ) : null}
          </div>

          <div className="mt-8 flex shrink-0 items-center lg:mt-0 lg:ml-10">
            {data.buttonLabel ? (
              <Link
                href={data.buttonUrl || "/p/contato"}
                className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-500 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <span>{data.buttonLabel}</span>
                <span aria-hidden="true">→</span>
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
