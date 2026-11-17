"use client";

import { useEffect, useState } from "react";
import { listCampaignsAction, resumeCampaignAction } from "@/lib/actions/email";

type Campaign = {
  id: string;
  name: string | null;
  subject: string;
  fromEmail: string;
  body: string;
  recipientCount: number;
  status: string;
  scheduledAt: string | null;
  createdAt: string;
  sentCount: number;
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Agendada",
  sending: "Enviando",
  sent: "Enviada",
  failed: "Falhou",
};

export default function CampaignList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [resuming, setResuming] = useState<string | null>(null);

  useEffect(() => {
    listCampaignsAction().then(setCampaigns).catch(() => setCampaigns([]));
  }, []);

  const handleResume = async (id: string) => {
    if (!window.confirm("Retomar esta campanha? O envio continuará no próximo ciclo do cron.")) return;
    setResuming(id);
    try {
      const res = await resumeCampaignAction(id);
      if (res.error) window.alert(res.error);
      else {
        window.alert(res.success || "Campanha retomada.");
        listCampaignsAction().then(setCampaigns).catch(() => {});
      }
    } finally {
      setResuming(null);
    }
  };

  if (campaigns.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
        Nenhuma campanha salva ainda. As campanhas enviadas e agendadas aparecerão aqui.
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {campaigns.map((c) => (
        <div key={c.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <button
            onClick={() => setExpanded(expanded === c.id ? null : c.id)}
            className="w-full text-left p-4 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
          >
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 truncate">{c.name || c.subject}</p>
              {c.name && <p className="text-[11px] text-slate-500 truncate">Assunto: {c.subject}</p>}
              <p className="text-xs text-slate-500 mt-0.5">
                De {c.fromEmail} · {c.recipientCount} destinatários · {new Date(c.createdAt).toLocaleString("pt-BR")}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="rounded-full bg-brand-50 text-brand-700 px-2.5 py-1 text-[11px] font-bold">
                {STATUS_LABEL[c.status] || c.status}
              </span>
              <span className="text-xs text-slate-400">{c.sentCount}/{c.recipientCount}</span>
              {(c.status === "pending" || c.status === "failed") && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleResume(c.id); }}
                  disabled={resuming === c.id}
                  className="rounded-lg bg-brand-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  {resuming === c.id ? "..." : "Retomar"}
                </button>
              )}
              <span className="text-slate-400">{expanded === c.id ? "▲" : "▼"}</span>
            </div>
          </button>
          {expanded === c.id && (
            <div className="border-t border-slate-200 p-4 bg-slate-50/50 space-y-3">
              {c.scheduledAt && (
                <p className="text-xs text-slate-600">
                  <strong>Agendada para:</strong> {new Date(c.scheduledAt).toLocaleString("pt-BR")}
                </p>
              )}
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase mb-1">Mensagem</p>
                <div className="whitespace-pre-wrap text-sm text-slate-700 bg-white rounded-lg border border-slate-200 p-3">
                  {c.body}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
