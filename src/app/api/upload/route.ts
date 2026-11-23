import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.blocked) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    await mkdir(UPLOAD_DIR, { recursive: true });

    // Otimiza: redimensiona (max 1200px) e converte para WebP qualidade 80
    const nomeBase = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const otimizado = await sharp(bytes)
      .rotate()
      .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80, effort: 4 })
      .toBuffer();

    const nomeArquivo = `${nomeBase}.webp`;
    await writeFile(path.join(UPLOAD_DIR, nomeArquivo), otimizado);

    const originalKB = Math.round(bytes.length / 1024);
    const otimizadoKB = Math.round(otimizado.length / 1024);

    return NextResponse.json({
      url: `/uploads/${nomeArquivo}`,
      originalKB,
      otimizadoKB,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erro ao processar imagem" }, { status: 500 });
  }
}
