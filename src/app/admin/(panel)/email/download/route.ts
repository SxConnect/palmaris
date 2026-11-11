import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getJmapSession } from "@/lib/jmap";

const DEFAULT_MAIL_PASSWORD = process.env.MAIL_DEFAULT_PASSWORD || "Palmaris@2026";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.blocked) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const blobId = searchParams.get("blobId");
  const name = searchParams.get("name") || "attachment";
  const accountId = searchParams.get("accountId") || "";

  if (!blobId) {
    return NextResponse.json({ error: "blobId ausente" }, { status: 400 });
  }

  try {
    const session = await getJmapSession(user.email, DEFAULT_MAIL_PASSWORD);
    const resolvedAccountId = accountId || session.accountId;
    const downloadUrl = `${session.apiUrl}download/${resolvedAccountId}/${blobId}/${encodeURIComponent(name)}`;

    const auth = Buffer.from(`${user.email}:${DEFAULT_MAIL_PASSWORD}`).toString("base64");
    const res = await fetch(downloadUrl, {
      headers: { Authorization: `Basic ${auth}` },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Anexo não encontrado" }, { status: 404 });
    }

    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "application/octet-stream";

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${name}"`,
        "Content-Length": String(buffer.byteLength),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
