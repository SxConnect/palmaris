"use client";

type Enviado = {
  id: string;
  recipient: string;
  subject: string | null;
  sentAt: string;
  opened: boolean;
  bounced: boolean;
};

type Recebido = {
  id: string;
  de: string;
  deNome: string | null;
  subject: string | null;
  receivedAt: string;
};

export default function EmailsTab({ detalhe }: {
  detalhe: {
    email: string | null;
    emailExtra: string | null;
    emailsEnviados: Enviado[];
    emailsRecebidos: Recebido[];
  };
}) {
  const emails = [detalhe.email, detalhe.emailExtra].filter(Boolean);
  const enviados = detalhe.emailsEnviados || [];
  const recebidos = detalhe.emailsRecebidos || [];

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600">
        <strong>E-mails deste contato:</strong> {emails.length ? emails.join(", ") : "nenhum cadastrado"}
        <span className="block mt-1 text-slate-400">
          {enviados.length} enviado(s) · {recebidos.length} recebido(s)
        </span>
      </div>

      {enviados.length === 0 && recebidos.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-6">
          Nenhum e-mail registrado. Cadastre o e-mail na aba Dados e use o botão "Importar e-mails" para trazer as mensagens da caixa.
        </p>
      ) : (
        <div className="space-y-2">
          {enviados.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase mb-1.5">📤 Enviados</p>
              <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 overflow-hidden">
                {enviados.map((e) => (
                  <div key={e.id} className="p-3 flex items-start justify-between gap-3 hover:bg-slate-50">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{e.subject || "(sem assunto)"}</p>
                      <p className="text-[11px] text-slate-500">
                        {new Date(e.sentAt).toLocaleString("pt-BR")} · para {e.recipient}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {e.opened && <span className="text-[10px] rounded bg-green-50 text-green-700 px-2 py-0.5">👁️ aberto</span>}
                      {e.bounced && <span className="text-[10px] rounded bg-red-50 text-red-700 px-2 py-0.5">🚫 bounce</span>}
                      {!e.opened && !e.bounced && <span className="text-[10px] rounded bg-slate-100 text-slate-600 px-2 py-0.5">enviado</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {recebidos.length > 0 && (
            <div className="mt-4">
              <p className="text-[11px] font-bold text-slate-500 uppercase mb-1.5">📥 Recebidos</p>
              <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 overflow-hidden">
                {recebidos.map((r) => (
                  <div key={r.id} className="p-3 hover:bg-slate-50">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{r.subject || "(sem assunto)"}</p>
                        <p className="text-[11px] text-slate-500">
                          de {r.deNome || r.de} &lt;{r.de}&gt; · {new Date(r.receivedAt).toLocaleString("pt-BR")}
                        </p>
                      </div>
                      <span className="text-[10px] rounded bg-blue-50 text-blue-700 px-2 py-0.5 shrink-0">recebido</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
