"use client";

import { useEffect, useState } from "react";
import { proxyMediaAction } from "@/lib/actions/whatsapp";

function formatarBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export default function MessageBubble({ msg, fromMe }: { msg: any; fromMe: boolean }) {
  const [midia, setMidia] = useState("");
  const mediaUrl = msg.mediaUrl || msg.url || "";
  const mediaType = msg.mediaType || "";
  const texto = msg.content || msg.text || msg.message || "";
  const nomeArquivo = msg.fileName || msg.filename || "";

  useEffect(() => {
    if (mediaUrl && /image|imageMessage|image\/|foto/i.test(mediaType + " " + mediaUrl)) {
      proxyMediaAction(mediaUrl).then(setMidia);
    }
  }, [mediaUrl, mediaType]);

  const bubbleClass = `max-w-[78%] rounded-xl px-3 py-2 text-xs ${
    fromMe ? "bg-brand-600 text-white" : "bg-white border border-slate-200 text-slate-700"
  }`;

  const legenda = (texto && texto !== "[imagem]" && texto !== "[video]" && texto !== "[audio]" && texto !== "[documento]" && texto !== "[media]")
    ? texto
    : "";

  return (
    <div className={`flex ${fromMe ? "justify-end" : "justify-start"}`}>
      <div className={bubbleClass}>
        {/* Imagem */}
        {(midia || (/^https?:\/\//.test(mediaUrl) && /image|foto/i.test(mediaType))) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={midia || mediaUrl}
            alt="imagem"
            className="max-w-full rounded-lg mb-1 cursor-pointer"
            onClick={() => window.open(midia || mediaUrl, "_blank")}
          />
        )}

        {/* Audio */}
        {/audio|^\[audio\]/i.test(mediaType + " " + texto) && (
          <div className={`flex items-center gap-2 rounded-lg p-2 mb-1 ${fromMe ? "bg-white/15" : "bg-slate-100"}`}>
            <span className="text-lg">🎤</span>
            {mediaUrl && /^https?:\/\//.test(mediaUrl) ? (
              <audio controls src={mediaUrl} className="h-8 max-w-[180px]" />
            ) : (
              <span>Áudio{msg.seconds ? ` · ${msg.seconds}s` : ""}</span>
            )}
          </div>
        )}

        {/* Video */}
        {/video|^\[video\]/i.test(mediaType + " " + texto) && (
          <div className={`flex items-center gap-2 rounded-lg p-2 mb-1 ${fromMe ? "bg-white/15" : "bg-slate-100"}`}>
            <span className="text-lg">🎬</span>
            {mediaUrl && /^https?:\/\//.test(mediaUrl) ? (
              <video controls src={mediaUrl} className="max-w-[200px] max-h-[150px] rounded" />
            ) : (
              <span>Vídeo</span>
            )}
          </div>
        )}

        {/* Documento */}
        {/document|pdf|excel|documento|\[documento\]/i.test(mediaType + " " + texto + " " + nomeArquivo) && (
          <a
            href={mediaUrl || "#"}
            target="_blank"
            rel="noreferrer"
            className={`flex items-center gap-2 rounded-lg p-2 mb-1 ${fromMe ? "bg-white/15" : "bg-slate-100"}`}
          >
            <span className="text-lg">📄</span>
            <span className="truncate">{nomeArquivo || texto.replace("[documento]", "Documento")}</span>
          </a>
        )}

        {/* Localizacao */}
        {/localiza/i.test(texto) && (
          <div className={`flex items-center gap-2 rounded-lg p-2 mb-1 ${fromMe ? "bg-white/15" : "bg-slate-100"}`}>
            <span className="text-lg">📍</span><span>Localização</span>
          </div>
        )}

        {/* Legenda / texto */}
        {legenda && <p className="whitespace-pre-wrap">{legenda}</p>}

        {/* Fallback para midia sem URL */}
        {!legenda && !midia && /^\[.*\]$/.test(texto) && (
          <p className={`italic ${fromMe ? "text-blue-100" : "text-slate-400"}`}>
            {texto === "[media]" ? "📎 mídia" : texto}
          </p>
        )}

        <p className={`text-[9px] mt-1 ${fromMe ? "text-blue-200" : "text-slate-400"}`}>
          {msg.timestamp ? new Date(msg.timestamp).toLocaleString("pt-BR") : ""}
        </p>
      </div>
    </div>
  );
}
