import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getSiteSettings } from "@/lib/site-settings";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.blocked) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const s = await getSiteSettings();
  const telefone = (s.phone || "").replace(/\D/g, "");
  const vcf = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "N:;Palmaris Representações;;;",
    "FN:Palmaris Representações",
    "ORG:Palmaris Representações",
    `TITLE:${s.tagline}`,
    `TEL;TYPE=CELL:+55${telefone}`,
    `EMAIL;TYPE=INTERNET:${s.email}`,
    "URL:https://palmaris.com.br",
    "ADR;TYPE=WORK:;;Av. Industrial, 1000;Rio de Janeiro;RJ;22775-000;Brasil",
    "NOTE:Automação Industrial | Projetos e Instrumentação | Soluções em Engenharia",
    "END:VCARD",
  ].join("\r\n");

  return new NextResponse(vcf, {
    status: 200,
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": 'attachment; filename="palmaris-contato.vcf"',
    },
  });
}
