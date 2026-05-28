import { NextResponse } from "next/server";
import { getActiveWhatsappLine } from "@/lib/whatsapp-lines";

export const runtime = "nodejs";
export const revalidate = 60;

export async function GET() {
  const line = await getActiveWhatsappLine();
  if (!line) {
    return NextResponse.json({ error: "WhatsApp hattı tanımlı değil" }, { status: 404 });
  }
  return NextResponse.json(line);
}
