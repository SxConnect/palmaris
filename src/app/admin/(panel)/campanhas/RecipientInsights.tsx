"use client";

import { useEffect, useState } from "react";
import { getRecipientStatsAction, type RecipientStats } from "@/lib/actions/email";

export default function RecipientInsights({
  onToggleRecipient,
  currentRecipients,
}: {
  onToggleRecipient?: (email: string, remove: boolean) => void;
  currentRecipients: string[];
}) {
  const [stats, setStats] = useState<RecipientStats[]>([]);
  const [filter, setFilter] = useState<"all" | "never" | "multi" | "bounced">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    getRecipientStatsAction().then(setStats).catch(() => setStats([]));
  }, []);

  const filtered = stats.filter((s) => {
    if (filter === "never" && !s.neverOpened) return false;
    if (filter === "multi" && s.timesSent < 2) return false;
    if (filter === "bounced" && !s.bounced) return false;
    if (search && !s.recipient.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">📊 Histórico de destinatários</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Veja quantas vezes cada e-mail foi enviado e se alguma foi aberta.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Buscar e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs w-full sm:w-48 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      <div className="p-3 border-b border-slate-200 flex gap-2 flex-wrap">
        {([
          ["all", "Todos"],
          ["never", "Nunca abertos"],
          ["multi", "Enviado 2+ vezes"],
          ["bounced", "Bounces"],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              filter === key
                ? "bg-brand-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="p-6 text-center text-sm text-slate-400">
          Nenhum destinatário encontrado com esse filtro.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
          {filtered.map((s) => {
            const inCurrent = currentRecipients.some((r) => r.toLowerCase() === s.recipient.toLowerCase());
            return (
              <div key={s.recipient} className="p-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 hover:bg-slate-50/50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{s.recipient}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="text-[11px] rounded bg-slate-100 text-slate-600 px-2 py-0.5">
                      Enviado {s.timesSent}x
                    </span>
                    <span
                      className={`text-[11px] rounded px-2 py-0.5 ${
                        s.neverOpened
                          ? "bg-red-50 text-red-700 font-bold"
                          : "bg-green-50 text-green-700"
                      }`}
                    >
                      {s.neverOpened ? "Nunca abriu" : `Aberto ${s.timesOpened}x`}
                    </span>
                    {s.timesSent >= 2 && s.neverOpened && (
                      <span className="text-[11px] rounded bg-amber-50 text-amber-700 px-2 py-0.5 font-bold">
                        ⚠️ {s.timesSent} envios sem abertura
                      </span>
                    )}
                    {s.bounced && (
                      <span className="text-[11px] rounded bg-red-100 text-red-800 px-2 py-0.5 font-bold" title={s.bounceReason || "Bounce"}>
                        🚫 Bounce
                      </span>
                    )}
                  </div>
                </div>
                {onToggleRecipient && (
                  <button
                    onClick={() => onToggleRecipient(s.recipient, inCurrent)}
                    className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      inCurrent
                        ? "border border-red-200 text-red-600 hover:bg-red-50"
                        : "border border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {inCurrent ? "Remover" : "Adicionar"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
