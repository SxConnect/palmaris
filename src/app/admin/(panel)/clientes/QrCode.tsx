"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function QrCode({ valor }: { valor: string }) {
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    if (!valor) return;
    QRCode.toDataURL(valor, { width: 220, margin: 1 }).then(setDataUrl).catch(() => setDataUrl(""));
  }, [valor]);

  if (!dataUrl) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={dataUrl} alt="QR Code do WhatsApp" className="rounded-lg border border-slate-200 bg-white p-2 w-[220px]" />
  );
}
