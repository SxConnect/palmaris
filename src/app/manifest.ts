import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Palmaris Representações — Webmail",
    short_name: "Palmaris",
    description: "Webmail e portal Palmaris Representações",
    start_url: "/admin/email",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0066f5",
    lang: "pt-BR",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
