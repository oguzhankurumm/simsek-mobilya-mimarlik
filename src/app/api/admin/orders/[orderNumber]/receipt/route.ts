import { NextResponse } from "next/server";
import { z } from "zod";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-user";

export const runtime = "nodejs";

const patchSchema = z.object({
  receiptImageUrl: z.string().url().nullable(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  const admin = await getCurrentUser({ admin: true });
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { orderNumber } = await params;
  const json = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
  }

  const existing = await prisma.order.findUnique({
    where: { orderNumber },
    select: { id: true, receiptImageUrl: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
  }

  // If replacing or removing, try to clean up the old blob.
  if (
    existing.receiptImageUrl &&
    existing.receiptImageUrl !== parsed.data.receiptImageUrl &&
    existing.receiptImageUrl.includes(".public.blob.vercel-storage.com")
  ) {
    await del(existing.receiptImageUrl, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }).catch(() => undefined);
  }

  await prisma.order.update({
    where: { id: existing.id },
    data: { receiptImageUrl: parsed.data.receiptImageUrl },
  });

  return NextResponse.json({ ok: true });
}
