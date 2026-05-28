import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { normalizeE164 } from "@/lib/whatsapp";

export const runtime = "nodejs";

const bodySchema = z
  .object({
    productId: z.string().min(1),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().min(7).max(20).optional().or(z.literal("")),
  })
  .refine((d) => Boolean(d.email) || Boolean(d.phone), {
    message: "E-posta veya telefon zorunlu",
  });

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Geçersiz veri" },
      { status: 400 },
    );
  }

  const { productId, email, phone } = parsed.data;

  // Confirm product exists + is currently OOS (don't accept signups on
  // available products — they're noise).
  const product = await prisma.product
    .findUnique({
      where: { id: productId },
      select: { id: true, stock: true, active: true },
    })
    .catch(() => null);
  if (!product || !product.active) {
    return NextResponse.json(
      { error: "Ürün bulunamadı" },
      { status: 404 },
    );
  }

  await prisma.stockNotification.create({
    data: {
      productId,
      email: email || null,
      phone: phone ? normalizeE164(phone) : null,
    },
  });

  return NextResponse.json({ ok: true });
}
