import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/order-number";
import {
  IDEMPOTENCY_HEADER,
  hashIdempotencyKey,
  isValidIdempotencyKey,
} from "@/lib/idempotency";
import { AUTH_COOKIE_NAME, verifyToken } from "@/lib/auth";
import { getPublicSiteSettings } from "@/lib/site-settings";
import { sendEmail, buildOrderConfirmationEmail } from "@/lib/send-email";
import { tlToKurus, formatPrice } from "@/lib/money";
import { buildWhatsappUrl } from "@/lib/whatsapp";
import { rateLimit, clientIpFromRequest } from "@/lib/rate-limit";

// POST /api/orders
//
// Creates an order. Mirrors the daf-yapi pattern but with the Phase 2/3 review
// findings baked in:
//   - Idempotency-Key header (T14) — sha256 stored on the row so retries
//     after a network glitch return the same order, not a new one.
//   - Server-side order number (T15) — non-enumerable SM-XXXXXXXX.
//   - Conditional UPDATE for stock (T16) — atomic decrement that fails fast
//     when stock runs out, instead of read-then-write race window.
//   - Server-side total (T17) — never trust client price; recompute from DB.
//   - Origin header CSRF guard (T18).

export const runtime = "nodejs";

const itemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
});

const bodySchema = z.object({
  items: z.array(itemSchema).min(1),
  ibanId: z.string().min(1).nullable().optional(),
  whatsappLineId: z.string().min(1).nullable().optional(),
  acceptedTerms: z.boolean(),
  guestName: z.string().min(2).max(120).optional(),
  guestPhone: z.string().min(8).max(20).optional(),
  guestEmail: z.string().email().optional(),
});

function originGuard(req: Request): NextResponse | null {
  const origin = req.headers.get("origin");
  const expected = process.env.NEXT_PUBLIC_SITE_URL;
  if (!origin) return null; // server-to-server fine
  if (!expected) return null; // dev relaxation
  if (origin === expected) return null;
  return NextResponse.json(
    { error: "Geçersiz origin" },
    { status: 403 },
  );
}

async function getUserFromCookie() {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function POST(req: Request) {
  const originBlock = originGuard(req);
  if (originBlock) return originBlock;

  // 30 orders per hour per IP is generous for a household ordering multiple
  // items but cuts off bot-driven stock-grabbing attempts.
  const ip = clientIpFromRequest(req);
  const ipLimit = rateLimit(`orders:ip:${ip}`, 30, 60 * 60 * 1000);
  if (!ipLimit.allowed) {
    return NextResponse.json(
      { error: "Çok fazla sipariş denemesi. Lütfen birkaç dakika bekleyin." },
      { status: 429 },
    );
  }

  // Maintenance mode short-circuits new orders.
  const settings = await getPublicSiteSettings();
  if (settings.maintenanceMode) {
    return NextResponse.json(
      { error: "Sipariş alımı geçici olarak durdurulmuştur" },
      { status: 503 },
    );
  }

  const rawIdempotencyKey = req.headers.get(IDEMPOTENCY_HEADER);
  if (!isValidIdempotencyKey(rawIdempotencyKey)) {
    return NextResponse.json(
      { error: "Idempotency-Key başlığı eksik veya geçersiz" },
      { status: 400 },
    );
  }
  const idempotencyHash = hashIdempotencyKey(rawIdempotencyKey!);

  // Idempotent replay — if we've seen this key, return the previous result.
  const existing = await prisma.order
    .findUnique({ where: { idempotencyKey: idempotencyHash } })
    .catch(() => null);
  if (existing) {
    return NextResponse.json({
      orderNumber: existing.orderNumber,
      idempotent: true,
    });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Geçersiz sipariş verisi", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const body = parsed.data;
  if (!body.acceptedTerms) {
    return NextResponse.json(
      { error: "Sözleşme onayı zorunludur" },
      { status: 400 },
    );
  }

  const user = await getUserFromCookie();

  // Fetch products from DB — server-computed totals only.
  const products = await prisma.product.findMany({
    where: { id: { in: body.items.map((i) => i.productId) }, active: true },
    include: { images: { where: { isMain: true }, take: 1 } },
  });
  if (products.length !== body.items.length) {
    return NextResponse.json(
      { error: "Bazı ürünler artık mevcut değil" },
      { status: 400 },
    );
  }

  const productById = new Map(products.map((p) => [p.id, p]));
  const orderItems: {
    productId: string;
    productName: string;
    productImage: string;
    originalPrice: Prisma.Decimal;
    salePrice: Prisma.Decimal;
    quantity: number;
    subtotal: Prisma.Decimal;
  }[] = [];
  let totalAmount = new Prisma.Decimal(0);

  for (const item of body.items) {
    const product = productById.get(item.productId)!;
    if (product.stock < item.quantity) {
      return NextResponse.json(
        { error: `${product.name} stokta yetersiz` },
        { status: 400 },
      );
    }
    const subtotal = product.salePrice.mul(item.quantity);
    totalAmount = totalAmount.plus(subtotal);
    orderItems.push({
      productId: product.id,
      productName: product.name,
      productImage: product.images[0]?.url ?? "",
      originalPrice: product.originalPrice,
      salePrice: product.salePrice,
      quantity: item.quantity,
      subtotal,
    });
  }

  // 8-char alphabet excludes 0/O/1/I/L → ~28B unique. Retry on collision.
  let orderNumber = generateOrderNumber();
  for (let attempt = 0; attempt < 5; attempt++) {
    const clash = await prisma.order
      .findUnique({ where: { orderNumber } })
      .catch(() => null);
    if (!clash) break;
    orderNumber = generateOrderNumber();
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      // Conditional stock decrement — fails the whole tx if any product runs
      // out between our check and the actual write.
      for (const item of body.items) {
        const updated = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (updated.count === 0) {
          const name =
            productById.get(item.productId)?.name ?? "Ürün";
          throw new Error(`${name} stokta kalmadı`);
        }
      }

      const created = await tx.order.create({
        data: {
          orderNumber,
          idempotencyKey: idempotencyHash,
          userId: user?.userId ?? null,
          guestName: user ? null : body.guestName,
          guestPhone: user ? null : body.guestPhone,
          guestEmail: user ? null : body.guestEmail,
          totalAmount,
          status: "PENDING",
          ibanId: body.ibanId ?? null,
          whatsappLineId: body.whatsappLineId ?? null,
          acceptedTerms: true,
          items: { create: orderItems },
        },
      });

      return created;
    });

    // Fire-and-forget confirmation email. Customer's address: user.email
    // when logged in, else body.guestEmail. Skip if neither is available.
    const recipientEmail = user
      ? (await prisma.user
          .findUnique({
            where: { id: user.userId },
            select: { email: true, name: true },
          })
          .catch(() => null))
      : null;

    const targetEmail = recipientEmail?.email ?? body.guestEmail ?? null;
    const targetName =
      recipientEmail?.name ?? body.guestName ?? "müşterimiz";

    if (targetEmail) {
      const ibanRow = body.ibanId
        ? await prisma.iban
            .findUnique({ where: { id: body.ibanId } })
            .catch(() => null)
        : null;
      const waRow = body.whatsappLineId
        ? await prisma.whatsappLine
            .findUnique({ where: { id: body.whatsappLineId } })
            .catch(() => null)
        : null;
      const totalKurus = tlToKurus(totalAmount.toString());
      const waLink = waRow
        ? buildWhatsappUrl(
            waRow.numberE164,
            `Merhaba, ${order.orderNumber} numaralı sipariş için dekont gönderiyorum.`,
          )
        : "";

      const { subject, text, html } = buildOrderConfirmationEmail({
        recipientName: targetName,
        orderNumber: order.orderNumber,
        totalTl: formatPrice(totalKurus),
        ibanBankName: ibanRow?.bankName ?? "—",
        ibanNumber: ibanRow?.ibanNumber ?? "—",
        ibanHolder: ibanRow?.accountHolder ?? "—",
        whatsappLink: waLink,
        items: orderItems.map((i) => ({
          name: i.productName,
          quantity: i.quantity,
          subtotalTl: formatPrice(tlToKurus(i.subtotal.toString())),
        })),
      });

      // Don't await — failed email shouldn't block the order response.
      void sendEmail({ to: targetEmail, subject, text, html });
    }

    return NextResponse.json({
      orderNumber: order.orderNumber,
      idempotent: false,
    });
  } catch (err) {
    console.error("ORDER_CREATE_ERROR", err);
    const message = err instanceof Error ? err.message : "Sunucu hatası";
    const isStockError = message.includes("stokta");
    return NextResponse.json(
      { error: message },
      { status: isStockError ? 409 : 500 },
    );
  }
}
