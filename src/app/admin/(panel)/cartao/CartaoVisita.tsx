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
                {s.linkedinUrl && <a href={s.linkedinUrl} target="_blank" rel="noreferrer" className="rounded-full bg-white/15 border border-white/25 w-9 h-9 flex items-center justify-center text-sm">in</a>}
                {s.instagramUrl && <a href={s.instagramUrl} target="_blank" rel="noreferrer" className="rounded-full bg-white/15 border border-white/25 w-9 h-9 flex items-center justify-center text-sm">📷</a>}
                <a href={waLink} target="_blank" rel="noreferrer" className="rounded-full bg-white/15 border border-white/25 w-9 h-9 flex items-center justify-center text-sm">💬</a>
              </div>

              <p className="mt-auto pt-6 text-[10px] text-blue-200">Soluções inteligentes para um mercado em constante evolução.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
