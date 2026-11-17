"use client";

import { useEffect, useState } from "react";
import { listReportsAction, type CampaignReportItem } from "@/lib/actions/email";

export default function ReportList() {
  const [reports, setReports] = useState<CampaignReportItem[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    listReportsAction().then(setReports).catch(() => setReports([]));
  }, []);

  if (reports.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
        Nenhum relatório ainda. O relatório é gerado automaticamente 24h após a conclusão da campanha.
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {reports.map((r) => (
        <div key={r.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <button
            onClick={() => setExpanded(expanded === r.id ? null : r.id)}
            className="w-full text-left p-4 hover:bg-slate-50 transition"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 truncate">📊 {r.subject}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Gerado em {new Date(r.generatedAt).toLocaleString("pt-BR")}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className="rounded bg-slate-100 text-slate-700 px-2 py-1 font-semibold">{r.totalSent} enviados</span>
                <span className="rounded bg-green-50 text-green-700 px-2 py-1 font-semibold">{r.totalDelivered} entregues</span>
                <span className="rounded bg-blue-50 text-blue-700 px-2 py-1 font-semibold">{r.totalOpened} abertos</span>
                <span className="rounded bg-red-50 text-red-700 px-2 py-1 font-semibold">{r.totalBounced} bounces</span>
                <span className="rounded bg-brand-50 text-brand-700 px-2 py-1 font-semibold">{r.openRate.toFixed(1)}% abertura</span>
              </div>
            </div>
          </button>
          {expanded === r.id && (
            <div className="border-t border-slate-200 p-4 bg-slate-50/50">
              <p className="text-sm text-slate-700">{r.summary}</p>
              <p className="text-xs text-slate-500 mt-2">
                <strong>{r.notOpened}</strong> destinatários entregues não abriram — candidatos a reenvio ou contato alternativo.
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
