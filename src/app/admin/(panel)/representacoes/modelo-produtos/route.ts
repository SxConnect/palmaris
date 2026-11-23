import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.blocked) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const csv = [
    "representacao,nome,descricao,categoria,imagens,destaque,ordem",
    "ENGEZER,Caldeira industrial,Caldeira a vapor 10 toneladas,Caldeiras,\"https://site.com.br/foto1.jpg;https://site.com.br/foto2.jpg\",sim,1",
    "PESCO,Compressor de ar,Compressor parafuso 50 hp,Compressores,,nao,2",
  ].join("\n");
  return new NextResponse("\uFEFF" + csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="modelo-produtos.csv"',
    },
  });
}
