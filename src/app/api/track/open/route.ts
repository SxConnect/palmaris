import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 1x1 transparent GIF (43 bytes)
const TRANSPARENT_GIF = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64",
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const trackingId = searchParams.get("id");

  if (trackingId) {
    // Record the open asynchronously (don't block the response)
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Fire and forget - don't await
    prisma.emailOpen
      .upsert({
        where: { trackingId },
        update: { openedAt: new Date(), userAgent, ip },
        create: { trackingId, recipient: "unknown", userAgent, ip },
      })
      .catch(() => {});
  }

  // Return transparent 1x1 GIF
  return new NextResponse(TRANSPARENT_GIF, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Content-Length": String(TRANSPARENT_GIF.length),
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
}
