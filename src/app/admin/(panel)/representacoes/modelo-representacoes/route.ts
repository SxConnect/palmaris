import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.blocked) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const csv = [
    "nome,slug,logoUrl,descricao,segmento,site,emailContato,telefone,responsavel,status,observacoes",
    "ENGEZER,engezer,/img/logo-engezer.png,Equipamentos industriais e caldeiras,Instrumentacao,https://engezer.com.br,vendas@engezer.com.br,(21) 9999-9999,Silvano Xavier,ativa,Representacao principal",
    "NOVA MARCA,nova-marca,,Descricao da nova representacao,Segmento,https://site.com.br,contato@site.com.br,,Marcio,ativa,",
  ].join("\n");
  return new NextResponse("\uFEFF" + csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="modelo-representacoes.csv"',
    },
  });
}
