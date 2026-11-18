"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function PwaInstallPrompt() {
  const [visivel, setVisivel] = useState(false);
  const [ios, setIos] = useState(false);
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [instalando, setInstalando] = useState(false);

  useEffect(() => {
    // Já instalado (rodando em standalone) ou já dispensado → nao mostrar
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (localStorage.getItem("pwa_install_dismissed") === "1") return;

    const ua = navigator.userAgent.toLowerCase();
    const isMobile = /android|iphone|ipad|ipod|mobile/.test(ua);
    if (!isMobile) return;

    const isIOS = /iphone|ipad|ipod/.test(ua);
    setIos(isIOS);

    if (isIOS) {
      setVisivel(true);
      return;
    }

    // Android/Chrome: captura o evento nativo de instalacao
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
      setVisivel(true);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  const dispensar = () => {
    localStorage.setItem("pwa_install_dismissed", "1");
    setVisivel(false);
  };

  const instalar = async () => {
    if (!promptEvent) return;
    setInstalando(true);
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    setInstalando(false);
    setPromptEvent(null);
    setVisivel(false);
    if (choice.outcome === "dismissed") {
      localStorage.setItem("pwa_install_dismissed", "1");
    }
  };

  if (!visivel) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50">
      <div className="rounded-2xl border border-brand-200 bg-white p-4 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon-192.png" alt="Palmaris" className="h-10 w-10 rounded-xl" />
            <div>
              <p className="text-sm font-bold text-slate-900">Instalar o app Palmaris</p>
              <p className="text-[11px] text-slate-500">Acesse seu e-mail e conversas com um toque.</p>
            </div>
          </div>
          <button onClick={dispensar} className="text-slate-400 text-lg leading-none" aria-label="Fechar">✕</button>
        </div>

        {ios ? (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-slate-600">
              No iPhone, toque em <strong>Compartilhar</strong> ⬆️ e depois em{" "}
              <strong>Adicionar à Tela de Início</strong>.
            </p>
            <button
              onClick={dispensar}
              className="w-full rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white"
            >
              Entendi
            </button>
          </div>
        ) : (
          <div className="mt-3 flex gap-2">
            <button onClick={dispensar} className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600">
              Agora não
            </button>
            <button
              onClick={instalar}
              disabled={!promptEvent || instalando}
              className="flex-1 rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
            >
              {instalando ? "Instalando..." : "Instalar app"}
            </button>
          </div>
        )}
        <p className="mt-2 text-[10px] text-slate-400">
          O app será adicionado à sua tela inicial. Você pode remover depois.
        </p>
      </div>
    </div>
  );
}
