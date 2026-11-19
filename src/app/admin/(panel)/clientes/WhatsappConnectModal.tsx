"use client";

import { useEffect, useState } from "react";
import QrCode from "./QrCode";
import {
  listSessionsAction,
  createSessionAction as createSession,
  pairSessionAction as pairSession,
  reconnectSessionAction,
  getSessionQrAction,
} from "@/lib/actions/whatsapp";

export default function WhatsappConnectModal({ onClose }: { onClose: () => void }) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [sid, setSid] = useState("");
  const [qr, setQr] = useState("");
  const [pareando, setPareando] = useState(false);
  const [erro, setErro] = useState("");
  const [info, setInfo] = useState("");
  const [nome, setNome] = useState("Palmaris");

  const carregar = async () => {
    const r = await listSessionsAction();
    if (r.error) setErro(r.error);
    else {
      setSessions(r.sessions);
      const ativa = r.sessions.find((s: any) => s.paired || s.state === "open");
      if (ativa) setSid(ativa.id);
      else if (r.sessions[0]) setSid(r.sessions[0].id);
    }
  };

  useEffect(() => { carregar(); }, []);

  useEffect(() => {
    if (!pareando || !sid) return;
    const buscar = async () => {
      const r = await getSessionQrAction(sid);
      if (r.error) return;
      if (r.paired) {
        setPareando(false);
        setQr("");
        setInfo("✅ WhatsApp conectado com sucesso!");
        await carregar();
        return;
      }
      if (r.qr) setQr(r.qr);
    };
    buscar();
    const int = setInterval(buscar, 2500);
    return () => clearInterval(int);
  }, [pareando, sid]);

  const conectar = async () => {
    let id = sid;
    if (!id) {
      const r = await createSession(nome.trim() || "Palmaris");
      if (r.error) { setErro(r.error); return; }
      if (!r.id) { setErro("Não foi possível criar sessão."); return; }
      id = r.id;
      setSid(id);
      await carregar();
    }
    const p = await pairSession(id);
    if (p.error) { setErro(p.error); return; }
    setPareando(true);
    setQr("");
    setInfo("Escaneie o QR abaixo com o WhatsApp.");
  };

  const sessaoAtual = sessions.find((s) => s.id === sid);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900">💬 Conectar WhatsApp</h3>
            <p className="text-xs text-slate-500 mt-0.5">PlugaWAPI — pareie seu número para usar no CRM.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 text-lg">✕</button>
        </div>

        {(erro || info) && (
          <div className={`rounded-lg border p-3 text-xs ${erro ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"}`}>
            {erro || info}
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">Sessão</label>
          <select value={sid} onChange={(e) => setSid(e.target.value)} className="input text-xs">
            <option value="">— nova sessão —</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name || s.id} {s.paired || s.state === "open" ? "🟢 conectada" : "⚪"}
              </option>
            ))}
          </select>
          {!sid && (
            <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome da sessão" className="input text-xs" />
          )}
        </div>

        <div className="flex gap-2">
          <button onClick={conectar} className="flex-1 rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white">
            📱 Gerar QR / Conectar
          </button>
          {sid && (
            <button onClick={async () => { const r = await reconnectSessionAction(sid); if (r.error) setErro(r.error); else setInfo("Reconectado."); }} className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600">
              Reconectar
            </button>
          )}
        </div>

        {sessaoAtual?.paired && !pareando && (
          <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-xs text-green-700 text-center">
            🟢 WhatsApp conectado como {sessaoAtual.jid || "sessão ativa"}. Você já pode usar o chat no CRM.
          </div>
        )}

        {(pareando || qr) && (
          <div className="rounded-lg border border-brand-200 bg-brand-50/40 p-4 flex flex-col items-center gap-2">
            <p className="text-xs font-bold text-brand-800">📱 Escaneie o QR com o WhatsApp</p>
            {qr ? <QrCode valor={qr} /> : <p className="text-xs text-slate-500">Gerando QR...</p>}
            <p className="text-[11px] text-slate-500 text-center">
              WhatsApp → Menu ⋮ → Aparelhos conectados → Conectar aparelho
            </p>
            {pareando && <button onClick={() => { setPareando(false); setQr(""); }} className="text-[11px] text-slate-500 hover:underline">Cancelar</button>}
          </div>
        )}
      </div>
    </div>
  );
}
