import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-user";

export const runtime = "nodejs";

const patchSchema = z.object({
  title: z.string().min(1).max(80).optional(),
  fullName: z.string().min(2).max(120).optional(),
  phone: z.string().min(6).max(30).optional(),
  city: z.string().min(1).max(80).optional(),
  district: z.string().min(1).max(80).optional(),
  addressLine: z.string().min(4).max(500).optional(),
  isDefault: z.boolean().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  const json = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
  }

  // Belongs-to check before mutation.
  const owned = await prisma.address.findFirst({
    where: { id, userId: me.id },
    select: { id: true },
  });
  if (!owned) {
    return NextResponse.json({ error: "Adres bulunamadı" }, { status: 404 });
  }

  // Clear-old-default + update in one transaction — no window where the user
  // has zero or two default addresses.
  await prisma.$transaction(async (tx) => {
    if (parsed.data.isDefault) {
      await tx.address.updateMany({
        where: { userId: me.id, isDefault: true, NOT: { id } },
        data: { isDefault: false },
      });
    }
    await tx.address.update({ where: { id }, data: parsed.data });
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  const deleted = await prisma.address.deleteMany({
    where: { id, userId: me.id },
  });
  if (deleted.count === 0) {
    return NextResponse.json({ error: "Adres bulunamadı" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
