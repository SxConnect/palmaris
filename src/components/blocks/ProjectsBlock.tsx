import type { ProjectsData } from "@/lib/blocks";

/**
 * Bloco "Nossos projetos": grade de cards (2 colunas no desktop).
 */
export default function ProjectsBlock({ data }: { data: ProjectsData }) {
  return (
    <section className="bg-neutral-100 py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center text-2xl font-black uppercase tracking-tight text-neutral-900 sm:text-3xl">
          {data.title}
        </h2>
        {data.subtitle ? (
          <p className="mx-auto mt-3 max-w-2xl text-center text-neutral-600">{data.subtitle}</p>
        ) : null}

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {data.items.map((item, index) => (
            <article
              key={index}
              className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-neutral-200 transition hover:shadow-md"
            >
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt={item.imageAlt || item.title}
                  className={`h-56 w-full bg-neutral-200 ${
                    item.fit === "contain" ? "object-contain p-4" : "object-cover"
                  }`}
                />
              ) : (
                <div className="flex h-56 w-full items-center justify-center bg-neutral-200 text-center text-sm text-neutral-500">
                  Imagem do projeto
                </div>
              )}
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-xl font-bold leading-snug text-neutral-900">{item.title}</h3>
                {item.description ? (
                  <p className="mt-3 leading-relaxed text-neutral-700">{item.description}</p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
