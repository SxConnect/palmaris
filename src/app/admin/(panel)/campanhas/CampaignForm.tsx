"use client";

import { useState, useTransition } from "react";
import { sendCampaignAction, scheduleCampaignAction } from "@/lib/actions/email";

export default function CampaignForm({
  availableSenders,
}: {
  availableSenders: string[];
}) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ error?: string; success?: string; sentCount?: number } | null>(null);
  const [recipientsText, setRecipientsText] = useState("");
  const [delay, setDelay] = useState(2);
  const [scheduleMode, setScheduleMode] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");

  const recipientList = recipientsText
    .split(/[\n,;]/)
    .map((e) => e.trim())
    .filter((e) => e.includes("@") && e.includes("."));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const action = (e.nativeEvent as any)?.submitter?.value || "send";

    startTransition(async () => {
      setResult(null);
      if (action === "schedule") {
        const res = await scheduleCampaignAction(null, formData);
        setResult(res);
      } else {
        const res = await sendCampaignAction(null, formData);
        setResult(res);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      {/* Aviso de boas práticas e reputação */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-800 leading-relaxed">
        <strong className="block text-sm font-bold text-amber-900 mb-1">
          ⚠️ Diretrizes de Entrega e Aquecimento de IP (Warm-up):
        </strong>
        Para evitar que seus e-mails caiam na caixa de spam do Gmail e Outlook, envie mensagens em lotes
        cadenciados. O sistema aplica automaticamente um intervalo de <strong>{delay} segundos</strong> entre cada envio
        e anexa o rodapé de cancelamento de inscrição (Unsubscribe) exigido pelos provedores.
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Remetente Oficial</label>
          <select name="fromEmail" className="input" defaultValue={availableSenders[0]}>
            {availableSenders.map((email) => (
              <option key={email} value={email}>
                {email}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-slate-500">
            A mensagem será assinada digitalmente (DKIM) com a identidade deste e-mail.
          </p>
        </div>

        <div>
          <label className="label">Intervalo de Segurança (Segundos por e-mail)</label>
          <input
            name="delay"
            type="number"
            min={1}
            max={10}
            className="input"
            value={delay}
            onChange={(e) => setDelay(Number(e.target.value))}
          />
          <p className="mt-1 text-[11px] text-slate-500">
            Pausa entre cada disparo (recomendado: 2 a 5 segundos).
          </p>
        </div>
      </div>

      {/* Modo de agendamento */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
        <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={scheduleMode}
            onChange={(e) => setScheduleMode(e.target.checked)}
            className="rounded text-brand-600"
          />
          <span>📅 Agendar envio para data/hora específica</span>
        </label>
        {scheduleMode && (
          <div className="mt-3">
            <label className="label">Data e hora do envio (horário de Brasília)</label>
            <input
              name="scheduledAt"
              type="datetime-local"
              className="input"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required={scheduleMode}
            />
            <p className="mt-1 text-[11px] text-slate-500">
              A campanha será enviada automaticamente no horário agendado via cron job na VPS.
            </p>
          </div>
        )}
      </div>

      <div>
        <label className="label">Assunto da Campanha *</label>
        <input
          name="subject"
          required
          placeholder="Ex.: Novas Soluções em Automação Industrial para sua Fábrica"
          className="input"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="label mb-0">Lista de Destinatários *</label>
          <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
            {recipientList.length} destinatários válidos detectados
          </span>
        </div>
        <textarea
          name="recipients"
          required
          rows={6}
          value={recipientsText}
          onChange={(e) => setRecipientsText(e.target.value)}
          placeholder="Cole a lista de e-mails aqui (um por linha ou separados por vírgula):&#10;cliente1@empresa.com.br&#10;gerente@industria.com.br"
          className="input font-mono text-xs"
        />
      </div>

      <div>
        <label className="label">Conteúdo da Mensagem *</label>
        <textarea
          name="body"
          required
          rows={8}
          placeholder="Escreva a mensagem da sua campanha. A assinatura oficial da Palmaris com logo e o link de descadastro serão adicionados automaticamente."
          className="input leading-relaxed"
        />
      </div>

      {/* Prévia da Assinatura Palmaris */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/logo-palmaris.jpg" alt="Logo" className="h-10 w-auto object-contain rounded" />
        <div className="text-xs text-slate-600 leading-tight">
          <strong>Assinatura oficial Palmaris:</strong> Logotipo em alta definição, dados de contato e termo de cancelamento de inscrição inclusos em todos os e-mails disparados.
        </div>
      </div>

      {result?.error && (
        <div className="rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700">{result.error}</div>
      )}
      {result?.success && (
        <div className="rounded-lg bg-green-50 p-3 text-xs font-semibold text-green-700">{result.success}</div>
      )}

      <input type="hidden" name="scheduledAt" value={scheduleMode ? scheduledAt : ""} />

      <div className="flex gap-3">
        <button
          type="submit"
          name="action"
          value="send"
          disabled={isPending || recipientList.length === 0 || scheduleMode}
          className="btn btn-primary flex-1 py-3 text-sm font-bold shadow-md transition disabled:opacity-50"
        >
          {isPending && !scheduleMode
            ? `Disparando campanha para ${recipientList.length} contatos... Não feche a página.`
            : `Disparar Agora (${recipientList.length} Contato(s))`}
        </button>
        <button
          type="submit"
          name="action"
          value="schedule"
          disabled={isPending || recipientList.length === 0 || !scheduleMode}
          className="btn flex-1 py-3 text-sm font-bold shadow-md transition disabled:opacity-50 bg-amber-500 text-white hover:bg-amber-600"
        >
          {isPending && scheduleMode
            ? `Agendando...`
            : `Agendar para ${scheduledAt ? new Date(scheduledAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "data selecionada"}`}
        </button>
      </div>
    </form>
  );
}
