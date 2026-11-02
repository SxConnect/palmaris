import type { PartnersData } from "@/lib/blocks";

/**
 * Seção de Parceiros da Palmaris Representações conforme mockup:
 * "Parceiros que ampliam possibilidades" com destaque para os logos da Pesco e Engezer.
 */
export default function PartnersBlock({ data }: { data: PartnersData }) {
  return (
    <section id="parceiros" className="relative scroll-mt-20 overflow-hidden bg-slate-50/70 py-20 sm:py-24">
      {/* Grafismos decorativos laterais tech (chevrons industriais em azul) */}
      <div
        className="pointer-events-none absolute -left-10 top-1/2 -translate-y-1/2 opacity-35"
        aria-hidden="true"
      >
        <div className="flex -skew-x-12 gap-2.5">
          <div className="h-28 w-3 rounded-full bg-brand-300" />
          <div className="h-28 w-3 rounded-full bg-brand-500" />
          <div className="h-28 w-3 rounded-full bg-brand-700" />
        </div>
      </div>

      <div
        className="pointer-events-none absolute -right-10 top-1/2 -translate-y-1/2 opacity-35"
        aria-hidden="true"
      >
        <div className="flex -skew-x-12 gap-2.5">
          <div className="h-28 w-3 rounded-full bg-brand-700" />
          <div className="h-28 w-3 rounded-full bg-brand-500" />
          <div className="h-28 w-3 rounded-full bg-brand-300" />
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {data.title}
          </h2>
          {data.subtitle ? (
            <p className="mx-auto mt-3 max-w-2xl text-base text-slate-600 sm:text-lg">
              {data.subtitle}
            </p>
          ) : null}
        </div>

        {/* Vitrine de parceiros com divisória e logotipos oficiais */}
        <div className="mt-12 flex flex-col items-center justify-center gap-8 sm:flex-row sm:gap-14 lg:gap-20">
          {data.items.map((partner, index) => (
            <div key={index} className="flex items-center">
              <div className="group flex h-28 w-64 sm:h-32 sm:w-72 items-center justify-center rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs transition duration-300 hover:border-brand-300 hover:shadow-md">
                {partner.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={partner.logoUrl}
                    alt={partner.name}
                    className="max-h-16 max-w-[210px] w-auto object-contain transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="text-center">
                    <span className="block text-2xl font-black tracking-wider text-slate-900 sm:text-3xl">
                      {partner.name}
                    </span>
                    {partner.category ? (
                      <span className="block text-xs font-semibold tracking-wider text-brand-600 uppercase">
                        {partner.category}
                      </span>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Divisória vertical no desktop entre os parceiros */}
              {index < data.items.length - 1 ? (
                <div className="hidden h-16 w-px bg-slate-300/80 sm:ml-14 sm:block lg:ml-20" aria-hidden="true" />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
