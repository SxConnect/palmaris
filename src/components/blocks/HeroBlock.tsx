import Link from "next/link";
import type { HeroData } from "@/lib/blocks";

/**
 * Bloco de Capa (Hero) da Palmaris Representações conforme o mockup:
 * "Conectamos indústria, tecnologia e soluções."
 * Call to action duplo e destaque visual com operador técnico industrial.
 */
export default function HeroBlock({ data }: { data: HeroData }) {
  const imageUrl = data.imageUrl || "/img/hero-operator.jpg";

  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-24 lg:py-28">
      {/* Elementos gráficos de fundo com efeito tech / industrial suave */}
      <div
        className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-brand-500/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/2 right-0 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-sky-400/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Coluna de texto */}
          <div className="lg:col-span-7">
            {data.eyebrow ? (
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3.5 py-1 text-xs font-bold tracking-widest text-brand-700 uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
                {data.eyebrow}
              </div>
            ) : null}

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl lg:leading-[1.12]">
              {data.title}{" "}
              <span className="text-brand-600">{data.highlightText}</span>
            </h1>

            {data.subtitle ? (
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl">
                {data.subtitle}
              </p>
            ) : null}

            <div className="mt-8 flex flex-wrap items-center gap-4 sm:gap-5">
              {data.ctaLabel ? (
                <Link
                  href={data.ctaUrl || "/p/contato"}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-7 py-3.5 text-base font-semibold text-white shadow-md shadow-brand-600/20 transition hover:bg-brand-700 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                >
                  <span>{data.ctaLabel}</span>
                  <span aria-hidden="true">→</span>
                </Link>
              ) : null}

              {data.secondaryCtaLabel ? (
                <Link
                  href={data.secondaryCtaUrl || "#solucoes"}
                  className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3.5 text-base font-semibold text-brand-700 transition hover:text-brand-800 hover:bg-brand-50/70"
                >
                  <span>{data.secondaryCtaLabel}</span>
                  <span aria-hidden="true">→</span>
                </Link>
              ) : null}
            </div>
          </div>

          {/* Coluna da imagem com arcos circulares tech */}
          <div className="relative lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Arcos gráficos decorativos */}
              <div
                className="pointer-events-none absolute -inset-4 rounded-3xl border border-brand-200/60"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute -inset-8 rounded-4xl border border-brand-100/50"
                aria-hidden="true"
              />

              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-tr from-brand-900 to-slate-800 shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={data.imageAlt || "Palmaris Representações"}
                  className="h-full w-full object-cover object-center transition duration-500 hover:scale-102"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
