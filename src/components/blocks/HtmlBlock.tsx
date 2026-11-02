import RichContent from "@/components/RichContent";

/**
 * Bloco de HTML livre.
 *
 * O conteúdo vem do editor do painel e é renderizado como está — inclusive os
 * shortcodes de galeria `[galeria slug="..."]`, que viram a galeria de fotos.
 * As classes disponíveis estão documentadas em `src/app/globals.css`
 * (`.almzo-prose`).
 */
export default function HtmlBlock({ content }: { content: string }) {
  if (!content.trim()) return null;

  return (
    <section className="bg-white py-12 sm:py-16">
      <RichContent html={content} className="almzo-prose mx-auto max-w-5xl px-4 sm:px-6" />
    </section>
  );
}
