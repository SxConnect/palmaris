import { splitByGalleryShortcode } from "@/lib/galleries";
import { convertYouTubeLinks } from "@/lib/youtube";

import GalleryView from "@/components/site/GalleryView";

/**
 * Renderiza um conteúdo HTML (notícia, página ou bloco de texto) substituindo:
 *  - os shortcodes `[galeria slug="..."]` pela galeria de fotos;
 *  - os links/shortcodes do YouTube por vídeos embutidos (embed).
 */
export default function RichContent({
  html,
  className = "almzo-prose",
}: {
  html: string;
  className?: string;
}) {
  const segments = splitByGalleryShortcode(html ?? "");

  return (
    <div className={className}>
      {segments.map((segment, index) =>
        segment.type === "html" ? (
          <div
            key={index}
            dangerouslySetInnerHTML={{ __html: convertYouTubeLinks(segment.content) }}
          />
        ) : (
          <GalleryView
            key={index}
            slug={segment.slug}
            columns={segment.columns}
            caption={segment.caption}
          />
        ),
      )}
    </div>
  );
}
