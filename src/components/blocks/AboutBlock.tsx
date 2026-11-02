import type { AboutData } from "@/lib/blocks";

function AboutFeatureIcon({ icon }: { icon: string }) {
  const iconClass = "h-5 w-5 text-sky-400";
  switch (icon) {
    case "handshake":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    case "target":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    case "user":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    case "shield":
    default:
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
  }
}

/**
 * Seção "Sobre a Palmaris":
 * Layout escuro institucional com destaques dos 4 diferenciais e imagem de refinaria.
 */
export default function AboutBlock({ data }: { data: AboutData }) {
  const imageUrl = data.imageUrl || "/img/about-refinery.jpg";

  return (
    <section id="sobre" className="relative scroll-mt-20 overflow-hidden bg-[#081a38] py-20 text-white sm:py-24">
      {/* Luz ambiente de fundo */}
      <div
        className="pointer-events-none absolute -right-40 top-0 h-96 w-96 rounded-full bg-brand-600/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Coluna de texto institucional e diferenciais */}
          <div className="lg:col-span-7">
            {data.eyebrow ? (
              <p className="text-xs font-bold tracking-widest text-sky-400 uppercase">
                {data.eyebrow}
              </p>
            ) : null}

            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl lg:leading-tight">
              {data.title}{" "}
              <span className="text-sky-400">{data.highlightText}</span>
            </h2>

            {data.text ? (
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                {data.text}
              </p>
            ) : null}

            {/* Grid 2x2 com os diferenciais */}
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {data.features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3.5 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xs transition hover:border-sky-400/30 hover:bg-white/10"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-500/15">
                    <AboutFeatureIcon icon={feature.icon} />
                  </div>
                  <span className="text-sm font-semibold text-slate-100">
                    {feature.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Coluna da foto da refinaria / planta industrial */}
          <div className="lg:col-span-5">
            <div className="overflow-hidden rounded-2xl border border-white/15 bg-slate-900/50 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={data.imageAlt || "Instalação industrial Palmaris"}
                className="h-full w-full object-cover object-center transition duration-500 hover:scale-103"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
