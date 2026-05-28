import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { AUTH_COOKIE_NAME, verifyToken } from "@/lib/auth";
import { SITE } from "@/config/site";
import { buildOrderStatusEmail, sendEmail } from "@/lib/send-email";

export const runtime = "nodejs";

// Customer-initiated cancel. Only allowed when:
//   1. The caller owns the order (cookie userId matches order.userId).
//   2. The order is still PENDING (no payment recorded yet).
// Restores stock in the same transaction so a cancel + re-order doesn't
// permanently lose inventory. Fires the CANCELLED status email.

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { orderNumber } = await params;
  const order = await prisma.order.findFirst({
    where: { orderNumber, userId: payload.userId },
    include: { items: { select: { productId: true, quantity: true } }, user: { select: { name: true, email: true } } },
  });
  if (!order) {
    return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
  }
  if (order.status !== "PENDING") {
    return NextResponse.json(
      { error: "Bu sipariş artık iptal edilemez. Lütfen WhatsApp üzerinden iletişime geçin." },
      { status: 409 },
    );
  }

  await prisma.$transaction(
    async (tx) => {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
      await tx.order.update({
        where: { id: order.id },
        data: { status: "CANCELLED" },
      });
    },
    { timeout: 15_000 },
  );

  // Fire status email so the cancellation is visible in the inbox.
  if (order.user?.email) {
    const trackingUrl = `${SITE.url}/hesabim/siparis/${order.orderNumber}`;
    const { subject, text, html } = buildOrderStatusEmail({
      recipientName: order.user.name ?? "müşterimiz",
      orderNumber: order.orderNumber,
      status: "CANCELLED",
      trackingUrl,
    });
    void sendEmail({ to: order.user.email, subject, text, html });
  }

  return NextResponse.json({ ok: true });
}
