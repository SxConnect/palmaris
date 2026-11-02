import type { WhyUsData } from "@/lib/blocks";

function WhyUsIcon({ icon }: { icon?: string }) {
  const iconClass = "h-6 w-6 text-brand-600";
  switch (icon) {
    case "shield-check":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    case "target":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
    case "users":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    case "cogs":
    default:
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
  }
}

/**
 * Seção "Por que escolher a Palmaris?":
 * Composição em 2 colunas com card azul-marinho de destaque à esquerda e 4 benefícios à direita.
 */
export default function WhyUsBlock({ data }: { data: WhyUsData }) {
  const imageUrl = data.imageUrl || "/img/why-us-operator.jpg";

  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
          {/* Card azul-marinho à esquerda */}
          <div className="overflow-hidden rounded-3xl bg-[#091e42] p-8 text-white shadow-xl sm:p-10 lg:col-span-6">
            <div className="flex flex-col gap-8 sm:flex-row sm:items-center">
              <div className="relative h-44 w-44 shrink-0 overflow-hidden rounded-2xl border border-white/20 bg-slate-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Especialista Palmaris"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                  {data.cardTitle}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
                  {data.cardDescription}
                </p>
              </div>
            </div>
          </div>

          {/* Lista de 4 diferenciais à direita */}
          <div className="space-y-6 lg:col-span-6">
            {data.benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4.5 transition hover:border-brand-200 hover:bg-white hover:shadow-sm"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                  <WhyUsIcon icon={benefit.icon} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {benefit.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
