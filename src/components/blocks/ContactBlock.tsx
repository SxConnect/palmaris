import { getSiteSettings } from "@/lib/site-settings";

import ContactForm from "@/components/site/ContactForm";

import type { ContactData } from "@/lib/blocks";

/**
 * Bloco "Formulário de contato".
 *
 * A mensagem é enviada para o e-mail da associação (configurável em
 * Configurações) e também fica registrada em /admin/mensagens.
 */
export default async function ContactBlock({ data }: { data: ContactData }) {
  const settings = await getSiteSettings();
  const recipient = data.recipient || settings.email;

  return (
    <section className="bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-black uppercase tracking-tight text-neutral-900 sm:text-3xl">
            {data.title}
          </h2>
          {data.subtitle ? (
            <p className="mx-auto mt-3 max-w-2xl text-neutral-600">{data.subtitle}</p>
          ) : null}
        </div>

        {data.intro ? (
          <p className="mx-auto mt-6 max-w-2xl text-center leading-relaxed text-neutral-700">
            {data.intro}
          </p>
        ) : null}

        <div className="mt-10 rounded-2xl border border-neutral-200 bg-neutral-50 p-6 sm:p-8">
          <ContactForm recipient={recipient} />
        </div>
      </div>
    </section>
  );
}
