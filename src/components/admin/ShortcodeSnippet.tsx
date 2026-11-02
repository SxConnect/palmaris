"use client";

import { useState } from "react";

/** Mostra um trecho de código (ex.: o shortcode da galeria) com botão de copiar. */
export default function ShortcodeSnippet({
  code,
  title = "Código para inserir no texto",
}: {
  code: string;
  title?: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <div>
      <p className="mb-1 text-sm font-medium text-neutral-700">{title}</p>
      <div className="flex items-center gap-2">
        <code className="flex-1 overflow-x-auto rounded-lg bg-neutral-900 px-3 py-2 text-sm text-neutral-100">
          {code}
        </code>
        <button
          type="button"
          className="btn text-xs"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            } catch {
              alert(`Copie manualmente: ${code}`);
            }
          }}
        >
          {copied ? "Copiado!" : "Copiar"}
        </button>
      </div>
    </div>
  );
}
