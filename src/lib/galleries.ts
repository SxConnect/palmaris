/**
 * Galerias de fotos — shortcode e utilidades de renderização.
 *
 * Uma galeria é criada no painel (Galeria de Fotos) e inserida em notícias,
 * páginas ou blocos de texto pelo shortcode:
 *
 *     [galeria slug="assembleia-junho"]
 *
 * Opções aceitas: `slug` (obrigatório), `columns` (nº de colunas) e
 * `caption` (texto exibido abaixo das fotos).
 */

export type GalleryAttrs = {
  slug: string;
  columns?: number;
  caption?: string;
};

export type ContentSegment =
  | { type: "html"; content: string }
  | { type: "gallery"; slug: string; columns?: number; caption?: string };

const SHORTCODE_REGEX = /\[galeria\b([^\]]*)\]/gi;

/** Monta o shortcode de uma galeria (usado pelo painel e pelo editor). */
export function galleryShortcode(slug: string, options?: { columns?: number; caption?: string }) {
  const parts = [`slug="${slug}"`];
  if (options?.columns) parts.push(`columns="${options.columns}"`);
  if (options?.caption) parts.push(`caption="${options.caption}"`);
  return `[galeria ${parts.join(" ")}]`;
}

/** Lê os atributos de um shortcode de galeria. */
export function parseGalleryShortcode(code: string): GalleryAttrs | null {
  const match = /^\[galeria\b([^\]]*)\]$/i.exec(code.trim());
  if (!match) return null;

  const attrs: Record<string, string> = {};
  const attrRegex = /(\w+)\s*=\s*"([^"]*)"/g;
  let found: RegExpExecArray | null;
  while ((found = attrRegex.exec(match[1])) !== null) {
    attrs[found[1].toLowerCase()] = found[2];
  }

  const slug = attrs.slug ?? attrs.id;
  if (!slug) return null;

  const columns = attrs.columns ? Number(attrs.columns) : undefined;

  return {
    slug,
    columns: columns && Number.isFinite(columns) ? Math.min(Math.max(columns, 1), 6) : undefined,
    caption: attrs.caption,
  };
}

/**
 * Divide um HTML em segmentos: partes de HTML e partes de galeria.
 * Usado pelo componente `RichContent` para renderizar a galeria como
 * componente React (com lightbox) no lugar do shortcode.
 */
export function splitByGalleryShortcode(html: string): ContentSegment[] {
  if (!html) return [];

  const segments: ContentSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  SHORTCODE_REGEX.lastIndex = 0;
  while ((match = SHORTCODE_REGEX.exec(html)) !== null) {
    const before = html.slice(lastIndex, match.index);
    if (before.trim()) segments.push({ type: "html", content: before });

    const attrs = parseGalleryShortcode(match[0]);
    if (attrs) {
      segments.push({
        type: "gallery",
        slug: attrs.slug,
        columns: attrs.columns,
        caption: attrs.caption,
      });
    } else {
      // Shortcode inválido: mantém o texto original para não perder conteúdo.
      segments.push({ type: "html", content: match[0] });
    }

    lastIndex = match.index + match[0].length;
  }

  const after = html.slice(lastIndex);
  if (after.trim()) segments.push({ type: "html", content: after });

  return segments;
}

/** Verifica se o texto contém alguma galeria. */
export function hasGalleryShortcode(html: string): boolean {
  SHORTCODE_REGEX.lastIndex = 0;
  return SHORTCODE_REGEX.test(html);
}
