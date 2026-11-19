import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.blocked) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const csv = [
    "nome,empresa,cargo,telefone,email,emailExtra,origem,tags,notas",
    "João Silva,ACME Industria,Gerente,5521999999999,joao@acme.com.br,,visita,cliente;automacao,Contato obtido na visita",
    "Maria Souza,Tech Solutions,Compradora,5521988888888,maria@tech.com.br,,indicacao,compras,Indicada pelo João",
  ].join("\n");

  return new NextResponse("\uFEFF" + csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="modelo-clientes-palmaris.csv"',
    },
  });
}
