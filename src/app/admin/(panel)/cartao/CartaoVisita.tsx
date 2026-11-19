"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

type Settings = {
  siteName: string;
  tagline: string;
  logoUrl: string;
  address: string;
  email: string;
  phone: string;
  facebookUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  cardOwner: string;
  cardSegmentos: string;
  cardChamada: string;
};

function IconLinkedIn({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77Z" />
    </svg>
  );
}
function IconFacebook({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M13.5 9H16l-.5 3h-2v7h-3v-7H9l.5-3h1.5V6.5A3.5 3.5 0 0 1 14.5 3H16v3h-1.5A1.5 1.5 0 0 0 13.5 7.5V9Z" />
    </svg>
  );
}
function IconInstagram({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 4.5c2.4 0 2.7 0 3.65.06.88.04 1.35.19 1.67.31.42.17.72.36 1.03.67.31.31.5.61.67 1.03.12.32.27.79.31 1.67.05.95.06 1.24.06 3.65s0 2.7-.06 3.65c-.04.88-.19 1.35-.31 1.67-.17.42-.36.72-.67 1.03-.31.31-.61.5-1.03.67-.32.12-.79.27-1.67.31-.95.05-1.24.06-3.65.06s-2.7 0-3.65-.06c-.88-.04-1.35-.19-1.67-.31a2.8 2.8 0 0 1-1.03-.67 2.8 2.8 0 0 1-.67-1.03c-.12-.32-.27-.79-.31-1.67C4.5 14.7 4.5 14.4 4.5 12s0-2.7.06-3.65c.04-.88.19-1.35.31-1.67.17-.42.36-.72.67-1.03.31-.31.61-.5 1.03-.67.32-.12.79-.27 1.67-.31C9.3 4.5 9.6 4.5 12 4.5Zm0 1.8c-2.37 0-2.66 0-3.6.06-.87.04-1.34.18-1.66.3-.42.17-.68.35-.98.65-.3.3-.48.56-.65.98-.12.32-.26.79-.3 1.66-.05.94-.06 1.23-.06 3.6s.01 2.66.06 3.6c.04.87.18 1.34.3 1.66.17.42.35.68.65.98.3.3.56.48.98.65.32.12.79.26 1.66.3.94.05 1.23.06 3.6.06s2.66-.01 3.6-.06c.87-.04 1.34-.18 1.66-.3.42-.17.68-.35.98-.65.3-.3.48-.56.65-.98.12-.32.26-.79.3-1.66.05-.94.06-1.23.06-3.6s-.01-2.66-.06-3.6c-.04-.87-.18-1.34-.3-1.66-.17-.42-.35-.68-.65-.98-.3-.3-.56-.48-.98-.65-.32-.12-.79-.26-1.66-.3C14.66 6.3 14.37 6.3 12 6.3Zm0 3.1a4.6 4.6 0 1 1 0 9.2 4.6 4.6 0 0 1 0-9.2Zm0 1.8a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6Zm5.6-2.1a1.07 1.07 0 1 1-2.14 0 1.07 1.07 0 0 1 2.14 0Z" />
    </svg>
  );
}
function IconWhatsApp({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.31 4.95L2 22l5.25-1.38a9.94 9.94 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm0 18.14a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.23 8.23 0 0 1-1.27-4.37c0-4.55 3.7-8.25 8.25-8.25 2.2 0 4.28.86 5.84 2.42a8.2 8.2 0 0 1 2.42 5.84c0 4.55-3.7 8.25-8.25 8.25Zm4.52-6.17c-.25-.13-1.47-.72-1.7-.81-.23-.08-.4-.13-.56.13-.16.25-.64.8-.79.97-.14.16-.29.18-.53.06-.25-.13-1.05-.39-2-1.23a7.5 7.5 0 0 1-1.38-1.72c-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.44-.06-.13-.56-1.36-.77-1.86-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1s.9 2.44 1.03 2.61c.13.17 1.78 2.72 4.31 3.81 2.53 1.09 2.53.73 2.98.68.46-.05 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.11-.23-.17-.48-.3Z" />
    </svg>
  );
}

export default function CartaoVisita({ settingsInicial }: { settingsInicial?: Settings }) {
  const [s, setS] = useState<Settings | null>(settingsInicial || null);
  const [qr, setQr] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!settingsInicial) {
      fetch("/api/site-settings")
        .then((r) => r.json())
        .then((d) => setS(d.settings || d))
        .catch(() => {});
    }
    QRCode.toDataURL("https://palmaris.com.br/cartao", { width: 300, margin: 1, color: { dark: "#0a2a6b", light: "#ffffff" } })
      .then(setQr)
      .catch(() => {});
  }, []);

  if (!s) {
    return <div className="p-8 text-center text-sm text-slate-400">Carregando cartão...</div>;
  }

  const tel = (s.phone || "").replace(/\D/g, "");
  const waLink = `https://wa.me/55${tel}`;
  const mailLink = `mailto:${s.email}`;
  const telLink = `tel:+55${tel}`;
  const partesSegmentos = (s.cardSegmentos || "").split("|").map((p) => p.trim()).filter(Boolean);
  const segmentos: Array<{ icon: string; label: string }> = [];
  for (let i = 0; i < partesSegmentos.length; i += 2) {
    segmentos.push({ icon: partesSegmentos[i] || "•", label: partesSegmentos[i + 1] || "" });
  }

  const compartilhar = async () => {
    const dados = {
      title: "Palmaris Representações",
      text: "Conectando soluções, construindo resultados. Fale com a Palmaris!",
      url: "https://palmaris.com.br/cartao",
    };
    if (navigator.share) {
      try { await navigator.share(dados); } catch {}
    } else {
      await navigator.clipboard.writeText("https://palmaris.com.br/cartao");
      setMsg("Link copiado!");
      setTimeout(() => setMsg(""), 2500);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">💳 Cartão de Visita Digital</h1>
          <p className="mt-1 text-sm text-slate-500">Compartilhe a Palmaris de forma inteligente.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <a href="/admin/cartao/download-vcf" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            📇 Adicionar aos Contatos
          </a>
          <button onClick={compartilhar} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
            ↗️ Compartilhar
          </button>
        </div>
      </div>

      {msg && <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-xs text-green-700">{msg}</div>}

      <div className="flex justify-center">
        <div className="w-full max-w-[400px] rounded-[2.5rem] border-[10px] border-slate-900 bg-slate-900 shadow-2xl overflow-hidden">
          <div className="relative min-h-[680px] bg-gradient-to-b from-[#0a2a6b] via-[#123a8f] to-[#0a2a6b] text-white overflow-hidden">
            {/* fundo com foto do tecnico */}
            <div
              className="absolute inset-0 opacity-25 bg-cover bg-center"
              style={{ backgroundImage: "url(/img/hero-operator.jpg)" }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a2a6b]/70 via-transparent to-[#0a2a6b]/90" />

            <div className="relative z-10 flex flex-col items-center px-6 py-8">
              {/* Logo */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/img/logo-palmaris.jpg" alt="Palmaris" className="h-20 w-auto rounded-lg bg-white/95 p-1.5 shadow-lg" />
              <h2 className="mt-4 text-xl font-black tracking-tight">PALMARIS</h2>
              <p className="text-center text-sm font-semibold italic text-blue-100">{s.tagline}</p>
              <p className="mt-1 text-center text-[11px] text-blue-200">Representações</p>
              {s.cardOwner && <p className="mt-1 text-center text-xs font-semibold text-white">{s.cardOwner}</p>}

              {/* Segmentos */}
              <div className="mt-5 grid grid-cols-3 w-full gap-2">
                {(segmentos.length > 0 ? segmentos : [
                  { icon: "⚙️", label: "Automação|Industrial" },
                  { icon: "🔧", label: "Projetos e|Instrumentação" },
                  { icon: "🤝", label: "Soluções em|Engenharia" },
                ]).map((seg) => (
                  <div key={seg.label} className="rounded-xl bg-white/10 border border-white/20 p-2 text-center backdrop-blur-sm">
                    <span className="text-xl">{seg.icon}</span>
                    <p className="mt-1 text-[9px] font-bold leading-tight whitespace-pre-line">{seg.label.replace("|", "\n")}</p>
                  </div>
                ))}
              </div>

              {/* Acoes */}
              <div className="mt-6 grid grid-cols-4 w-full gap-2">
                <a href={mailLink} className="flex flex-col items-center gap-1 rounded-xl bg-white/10 border border-white/20 p-3 hover:bg-white/20">
                  <span className="text-xl">✉️</span><span className="text-[9px] font-semibold">E-mail</span>
                </a>
                <a href={telLink} className="flex flex-col items-center gap-1 rounded-xl bg-white/10 border border-white/20 p-3 hover:bg-white/20">
                  <span className="text-xl">📞</span><span className="text-[9px] font-semibold">Comercial</span>
                </a>
                <a href={waLink} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1 rounded-xl bg-green-500/30 border border-green-300/40 p-3 hover:bg-green-500/40">
                  <span className="text-xl">💬</span><span className="text-[9px] font-semibold">WhatsApp</span>
                </a>
                <a href="https://palmaris.com.br" target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1 rounded-xl bg-white/10 border border-white/20 p-3 hover:bg-white/20">
                  <span className="text-xl">🌐</span><span className="text-[9px] font-semibold">Site</span>
                </a>
              </div>

              {/* Localizacao */}
              <div className="mt-5 w-full rounded-xl bg-white/10 border border-white/20 p-3 text-center backdrop-blur-sm">
                <span className="text-lg">📍</span>
                <p className="text-[11px] font-semibold mt-1">Localização</p>
                <p className="text-[10px] text-blue-100">{s.address}</p>
              </div>

              {/* QR + compartilhar */}
              <div className="mt-5 flex flex-col items-center">
                {qr && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qr} alt="QR do cartão" className="rounded-lg bg-white p-2 w-32" />
                )}
                <p className="mt-2 text-[10px] text-blue-200 text-center">{s.cardChamada || "Fale conosco pelo WhatsApp"}</p>
                <button onClick={compartilhar} className="mt-2 rounded-full bg-white/15 border border-white/30 px-4 py-1.5 text-[11px] font-semibold hover:bg-white/25">
                  Compartilhar
                </button>
              </div>

              {/* Redes sociais */}
              <div className="mt-5 flex gap-3">
                {s.facebookUrl && <a href={s.facebookUrl} target="_blank" rel="noreferrer" title="Facebook" className="rounded-full bg-white/15 border border-white/25 w-9 h-9 flex items-center justify-center"><IconFacebook className="h-4 w-4" /></a>}
                {s.instagramUrl && <a href={s.instagramUrl} target="_blank" rel="noreferrer" title="Instagram" className="rounded-full bg-white/15 border border-white/25 w-9 h-9 flex items-center justify-center"><IconInstagram className="h-4 w-4" /></a>}
                {s.linkedinUrl && <a href={s.linkedinUrl} target="_blank" rel="noreferrer" title="LinkedIn" className="rounded-full bg-white/15 border border-white/25 w-9 h-9 flex items-center justify-center"><IconLinkedIn className="h-4 w-4" /></a>}
                <a href={waLink} target="_blank" rel="noreferrer" title="WhatsApp" className="rounded-full bg-green-500/30 border border-green-300/40 w-9 h-9 flex items-center justify-center"><IconWhatsApp className="h-4 w-4" /></a>
              </div>

              <p className="mt-auto pt-6 text-[10px] text-blue-200">Soluções inteligentes para um mercado em constante evolução.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
