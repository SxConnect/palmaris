import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Saída autônoma: o servidor roda apenas com o que o Next considera
  // necessário (usado na imagem Docker).
  output: "standalone",
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
