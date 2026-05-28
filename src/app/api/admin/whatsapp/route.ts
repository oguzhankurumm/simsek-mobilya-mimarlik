import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-user";
import { normalizeE164 } from "@/lib/whatsapp";
import { logAdminAction } from "@/lib/audit-log";

export const runtime = "nodejs";

const whatsappSchema = z.object({
  label: z.string().min(1).max(120),
  number: z.string().min(6).max(40),
  active: z.boolean().default(true),
  displayOrder: z.number().int().default(0),
});

export async function POST(req: Request) {
  const admin = await getCurrentUser({ admin: true });
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = whatsappSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
  }
  const line = await prisma.whatsappLine.create({
    data: {
      ...parsed.data,
      numberE164: normalizeE164(parsed.data.number),
    },
  });
  await logAdminAction({
    admin: { id: admin.id, email: admin.email },
    request: req,
    action: "WHATSAPP_CREATE",
    resource: "whatsappLine",
    resourceId: line.id,
    detail: { label: parsed.data.label, number: parsed.data.number },
  });
  return NextResponse.json({ id: line.id });
}
