/**
 * Converte links do YouTube em vídeos embutidos (embed) no conteúdo.
 *
 * Aceita os formatos:
 *   - https://www.youtube.com/watch?v=VIDEO_ID
 *   - https://youtube.com/watch?v=VIDEO_ID
 *   - https://youtu.be/VIDEO_ID
 *   - https://www.youtube.com/embed/VIDEO_ID
 *   - https://www.youtube.com/shorts/VIDEO_ID
 *
 * E também o shortcode: [youtube url="https://youtu.be/VIDEO_ID"]
 *
 * A conversão é feita no servidor (RichContent), antes de renderizar,
 * então o HTML final já contém o <iframe> responsivo.
 */

const YOUTUBE_SHORTCODE_REGEX = /\[youtube\b([^\]]*)\]/gi;

/** Extrai o ID do vídeo de uma URL do YouTube (ou null se não for do YouTube). */
export function extractYouTubeId(url: string): string | null {
  const trimmed = (url || "").trim();
  if (!trimmed) return null;

  let match = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
  if (match) return match[1];

  match = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
  if (match) return match[1];

  match = trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{6,})/);
  if (match) return match[1];

  match = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,})/);
  if (match) return match[1];

  return null;
}

/** Monta o shortcode de um vídeo do YouTube. */
export function youtubeShortcode(url: string) {
  return `[youtube url="${url}"]`;
}

/** Lê os atributos de um shortcode de vídeo. */
export function parseYouTubeShortcode(code: string): { url: string; title?: string } | null {
  const match = /^\[youtube\b([^\]]*)\]$/i.exec(code.trim());
  if (!match) return null;

  const attrs: Record<string, string> = {};
  const attrRegex = /(\w+)\s*=\s*"([^"]*)"/g;
  let found: RegExpExecArray | null;
  while ((found = attrRegex.exec(match[1])) !== null) {
    attrs[found[1].toLowerCase()] = found[2];
  }

  const url = attrs.url ?? attrs.id ?? attrs.src;
  if (!url) return null;

  return { url, title: attrs.title };
}

/** Gera o iframe responsivo de um vídeo do YouTube. */
export function youtubeEmbedHtml(videoId: string, title?: string): string {
  const safeTitle = (title || "Vídeo do YouTube").replace(/"/g, "&quot;");
  return `<div class="almzo-video">
  <iframe
    src="https://www.youtube.com/embed/${videoId}"
    title="${safeTitle}"
    loading="lazy"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen
    referrerpolicy="strict-origin-when-cross-origin"
  ></iframe>
</div>`;
}

/**
 * Converte URLs do YouTube em vídeos embutidos dentro de um HTML.
 *
 * 1) Processa os shortcodes `[youtube url="..."]`.
 * 2) Converte URLs soltas (fora de atributos href/src) em embeds.
 *
 * URLs dentro de atributos (href="...", src="...") são preservadas como
 * links normais — só o texto solto vira vídeo.
 */
export function convertYouTubeLinks(html: string): string {
  if (!html) return "";

  let result = html;

  // 1. Shortcodes [youtube url="..."]
  result = result.replace(YOUTUBE_SHORTCODE_REGEX, (match) => {
    const parsed = parseYouTubeShortcode(match);
    if (!parsed) return match;
    const videoId = extractYouTubeId(parsed.url);
    if (!videoId) return match;
    return youtubeEmbedHtml(videoId, parsed.title);
  });

  // 2. URLs soltas: protege as que estão dentro de atributos href/src.
  const placeholders: string[] = [];
  const protectAttr = (full: string) => {
    placeholders.push(full);
    return `__YT_PROTECTED_${placeholders.length - 1}__`;
  };

  // Protege URLs de atributos href="..." e src="..."
  let protectedHtml = result.replace(
    /((?:href|src)\s*=\s*")([^"]*youtube[^"]*)(")/gi,
    (_m, prefix, url, suffix) => `${prefix}${protectAttr(url)}${suffix}`,
  );
  protectedHtml = protectedHtml.replace(
    /((?:href|src)\s*=\s*')([^']*youtube[^']*)(')/gi,
    (_m, prefix, url, suffix) => `${prefix}${protectAttr(url)}${suffix}`,
  );

  // Converte as URLs soltas restantes.
  const urlRegex = /https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?[^\s"'<>]*v=[a-zA-Z0-9_-]{6,}|embed\/[a-zA-Z0-9_-]{6,}|shorts\/[a-zA-Z0-9_-]{6,})|youtu\.be\/[a-zA-Z0-9_-]{6,})[^\s"'<>]*/gi;

  protectedHtml = protectedHtml.replace(urlRegex, (url) => {
    const videoId = extractYouTubeId(url);
    if (!videoId) return url;
    return youtubeEmbedHtml(videoId);
  });

  // Restaura as URLs protegidas.
  result = protectedHtml.replace(/__YT_PROTECTED_(\d+)__/g, (_m, index) => placeholders[Number(index)]);

  return result;
}
