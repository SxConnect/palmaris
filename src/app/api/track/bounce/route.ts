import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CRON_SECRET = process.env.CRON_SECRET || "palmaris-cron-secret-2026";

export async function POST(request: Request) {
  // Protegido pelo mesmo segredo do cron
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { recipient, reason } = body;

    if (!recipient || typeof recipient !== "string") {
      return NextResponse.json({ error: "recipient required" }, { status: 400 });
    }

    await prisma.emailBounce.create({
      data: {
        recipient: recipient.toLowerCase().trim(),
        reason: typeof reason === "string" ? reason.slice(0, 500) : null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
