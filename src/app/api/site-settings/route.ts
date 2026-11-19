import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getSiteSettings } from "@/lib/site-settings";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.blocked) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const settings = await getSiteSettings();
  return NextResponse.json({ settings });
}
