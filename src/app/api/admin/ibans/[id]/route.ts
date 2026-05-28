import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-user";
import { logAdminAction } from "@/lib/audit-log";

export const runtime = "nodejs";

const patchSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  bankName: z.string().min(1).max(120).optional(),
  accountHolder: z.string().min(1).max(120).optional(),
  ibanNumber: z.string().min(10).max(40).optional(),
  active: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getCurrentUser({ admin: true });
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { id } = await params;
  const json = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
  }
  await prisma.iban.update({ where: { id }, data: parsed.data });
  await logAdminAction({
    admin: { id: admin.id, email: admin.email },
    request: req,
    action: "IBAN_PATCH",
    resource: "iban",
    resourceId: id,
    detail: parsed.data,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getCurrentUser({ admin: true });
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { id } = await params;
  await prisma.iban.delete({ where: { id } });
  await logAdminAction({
    admin: { id: admin.id, email: admin.email },
    request: req,
    action: "IBAN_DELETE",
    resource: "iban",
    resourceId: id,
  });
  return NextResponse.json({ ok: true });
}
