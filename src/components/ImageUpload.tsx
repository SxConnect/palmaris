"use client";

import { useState } from "react";

export default function ImageUpload({
  value,
  onChange,
  max = 1,
  label = "Imagem",
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
  label?: string;
}) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [info, setInfo] = useState("");

  const enviar = async (files: FileList | null) => {
    if (!files) return;
    let urls = [...value];
    setEnviando(true);
    setErro("");
    try {
      for (const file of Array.from(files).slice(0, max - urls.length)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro no upload");
        urls.push(data.url);
        setInfo(`${data.originalKB} KB → ${data.otimizadoKB} KB`);
      }
      onChange(urls.slice(0, max));
    } catch (e: any) {
      setErro(e.message || "Erro no upload");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1">{label}</label>
      <div className="flex flex-wrap gap-2">
        {value.map((url, i) => (
          <div key={i} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-20 w-20 object-cover rounded-lg border border-slate-200" />
            <button
              type="button"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-[10px]"
            >
              ✕
            </button>
          </div>
        ))}
        {value.length < max && (
          <label className="h-20 w-20 rounded-lg border border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 text-slate-400">
            <span className="text-center text-[10px]">{enviando ? "..." : "📷 Foto"}</span>
            <input
              type="file"
              accept="image/*"
              multiple={max > 1}
              onChange={(e) => enviar(e.target.files)}
              className="hidden"
            />
          </label>
        )}
      </div>
      {erro && <p className="mt-1 text-[10px] text-red-600">{erro}</p>}
      {info && <p className="mt-1 text-[10px] text-green-600">Otimizado: {info}</p>}
      <p className="mt-1 text-[10px] text-slate-400">WebP otimizado (máx. 1200px) — {value.length}/{max} imagem(ns)</p>
    </div>
  );
}
