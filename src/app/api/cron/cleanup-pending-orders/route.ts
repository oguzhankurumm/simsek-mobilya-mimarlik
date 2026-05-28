import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SITE } from "@/config/site";
import { buildOrderStatusEmail, sendEmail } from "@/lib/send-email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Auto-cancels PENDING orders older than 7 days. Triggered daily by Vercel
// Cron (see vercel.json). Restores stock + emails the customer per row.
//
// Authorisation: Vercel signs cron requests with the project's CRON_SECRET
// in the `Authorization: Bearer <secret>` header. In dev (no secret set)
// we accept any request so it can be invoked manually for testing.

const STALE_DAYS = 7;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function isAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const threshold = new Date(Date.now() - STALE_DAYS * MS_PER_DAY);

  // Pull the candidates first (so we can restore stock + email). Then a
  // bulk update flips them all in one round-trip. Stock restoration is
  // best-effort — if a stock UPDATE fails we still cancel the order.
  const stale = await prisma.order.findMany({
    where: { status: "PENDING", createdAt: { lt: threshold } },
    include: {
      items: { select: { productId: true, quantity: true } },
      user: { select: { email: true, name: true } },
    },
    take: 500,
  });

  if (stale.length === 0) {
    return NextResponse.json({ ok: true, cancelled: 0 });
  }

  // Restore stock + cancel orders in a single interactive transaction.
  // Interactive form (callback) keeps the types sane and lets us re-use
  // the bulk updateMany at the end.
  await prisma.$transaction(
    async (tx) => {
      for (const order of stale) {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
      await tx.order.updateMany({
        where: { id: { in: stale.map((o) => o.id) } },
        data: { status: "CANCELLED" },
      });
    },
    { timeout: 30_000 },
  );

  let emailsSent = 0;
  await Promise.all(
    stale.map(async (order) => {
      const recipient = order.user?.email ?? order.guestEmail ?? null;
      if (!recipient) return;
      const name = order.user?.name ?? order.guestName ?? "müşterimiz";
      const trackingUrl = order.userId
        ? `${SITE.url}/hesabim/siparis/${order.orderNumber}`
        : `${SITE.url}/siparis-takibi`;
      const { subject, text, html } = buildOrderStatusEmail({
        recipientName: name,
        orderNumber: order.orderNumber,
        status: "CANCELLED",
        trackingUrl,
      });
      const ok = await sendEmail({ to: recipient, subject, text, html });
      if (ok) emailsSent += 1;
    }),
  );

  return NextResponse.json({
    ok: true,
    cancelled: stale.length,
    emailsSent,
    threshold: threshold.toISOString(),
  });
}
