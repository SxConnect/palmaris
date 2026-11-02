"use client";

import { useActionState } from "react";

import { sendContactMessage } from "@/lib/actions/contact";

const SUBJECTS = [
  "Automação e Controle",
  "Painéis Elétricos",
  "Telemetria e Supervisão",
  "Monitoramento Ambiental (emissões e ETEs)",
  "Eficiência em Combustão",
  "Segurança e Detecção de Gases",
  "Manutenção Industrial",
  "Parcerias e Representações",
  "Outro assunto",
];

/**
 * Formulário de contato do site.
 * A mensagem é enviada para o e-mail da associação e também fica
 * registrada no painel (Admin → Mensagens).
 */
export default function ContactForm({
  recipient,
  subjectOptions = SUBJECTS,
}: {
  /** E-mail que recebe as mensagens (vem das configurações do site). */
  recipient?: string;
  subjectOptions?: string[];
}) {
  const [state, action, pending] = useActionState(sendContactMessage, null);

  return (
    <form action={action} className="space-y-4">
      {/* Campo isca contra robôs (invisível para humanos) */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Não preencha este campo</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="nome" className="label">
            Nome *
          </label>
          <input id="nome" name="name" className="input" placeholder="Como podemos te chamar?" required />
        </div>
        <div>
          <label htmlFor="email" className="label">
            E-mail *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="input"
            placeholder="seu@email.com"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="assunto" className="label">
          Assunto
        </label>
        <select id="assunto" name="subject" className="input" defaultValue={subjectOptions[0]}>
          {subjectOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="mensagem" className="label">
          Mensagem *
        </label>
        <textarea
          id="mensagem"
          name="message"
          rows={7}
          className="input"
          placeholder="Descreva sua demanda industrial, tipo de processo ou desafio operacional…"
          required
        />
      </div>

      {state?.error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      ) : null}
      {state?.success ? (
        <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{state.success}</p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Enviando…" : "ENVIAR MENSAGEM"}
        </button>
        {recipient ? (
          <p className="text-xs text-neutral-500">
            A mensagem é enviada para{" "}
            <a href={`mailto:${recipient}`} className="underline">
              {recipient}
            </a>
          </p>
        ) : null}
      </div>
    </form>
  );
}
