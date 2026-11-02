"use client";

/** Botão que copia o endereço público da imagem para a área de transferência. */
export default function CopyUrlButton({ url }: { url: string }) {
  return (
    <button
      type="button"
      className="btn text-[11px]"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          alert("Endereço da imagem copiado.");
        } catch {
          alert(`Copie manualmente: ${url}`);
        }
      }}
    >
      Copiar endereço
    </button>
  );
}
