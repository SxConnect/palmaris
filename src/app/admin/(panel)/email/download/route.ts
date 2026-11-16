import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";

const DEFAULT_MAIL_PASSWORD = process.env.MAIL_DEFAULT_PASSWORD || "Palmaris@2026";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.blocked) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  return NextResponse.json({ error: "Download de anexos não disponível com IMAP" }, { status: 501 });
}
