import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getEmailDetail } from "@/lib/jmap";

const DEFAULT_MAIL_PASSWORD = process.env.MAIL_DEFAULT_PASSWORD || "Palmaris@2026";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.blocked) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const emailId = searchParams.get("id");

  if (!emailId) {
    return NextResponse.json({ error: "ID ausente" }, { status: 400 });
  }

  try {
    const detail = await getEmailDetail(user.email, DEFAULT_MAIL_PASSWORD, emailId);
    return NextResponse.json(detail);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
