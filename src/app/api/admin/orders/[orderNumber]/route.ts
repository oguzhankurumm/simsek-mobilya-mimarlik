import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-user";

export const runtime = "nodejs";

const patchSchema = z.object({
  status: z.enum([
    "PENDING",
    "PAYMENT_RECEIVED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ]),
  notes: z.string().max(2000).optional(),
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
    return NextResponse.json(
      { error: "Geçersiz veri" },
      { status: 400 },
    );
  }

  const updated = await prisma.order.updateMany({
    where: { orderNumber },
    data: parsed.data,
  });
  if (updated.count === 0) {
    return NextResponse.json(
      { error: "Sipariş bulunamadı" },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true });
}
