import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "https://palmarisrepresentacoes.com.br"),
  title: {
    default: "Palmaris Representações — Conectamos Indústria, Tecnologia e Soluções",
    template: "%s | Palmaris Representações",
  },
  description:
    "Integração de soluções industriais, automação e parceiros especializados para desafios reais de operação. Conectamos empresas a alta performance.",
  keywords: [
    "Palmaris",
    "Palmaris Representações",
    "automação industrial",
    "controle",
    "telemetria",
    "painéis elétricos",
    "monitoramento ambiental",
    "eficiência energética",
    "soluções industriais",
  ],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: "Palmaris Representações",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-white text-neutral-900 antialiased">{children}</body>
    </html>
  );
}
