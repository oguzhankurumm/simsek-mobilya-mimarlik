import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SITE } from "@/config/site";
import { buildOrderStatusEmail, sendEmail } from "@/lib/send-email";
import { restoreStock } from "@/lib/order-stock";

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

  // Claim each stale order's PENDING -> CANCELLED transition individually and
  // restore its stock only when this run actually performed the cancel. Without
  // the per-row `status: "PENDING"` guard, an order the customer cancelled (or a
  // parallel cron invocation handled) between our findMany and this transaction
  // would have its stock restored a second time here — permanent oversell. The
  // returned ids are the ones we truly cancelled, so we email only those.
  const cancelledIds = await prisma.$transaction(
    async (tx) => {
      const claimed: string[] = [];
      for (const order of stale) {
        const res = await tx.order.updateMany({
          where: { id: order.id, status: "PENDING" },
          data: { status: "CANCELLED" },
        });
        if (res.count === 0) continue;
        await restoreStock(tx, order.items);
        claimed.push(order.id);
      }
      return claimed;
    },
    { timeout: 30_000 },
  );

  const claimedSet = new Set(cancelledIds);
  const cancelledOrders = stale.filter((o) => claimedSet.has(o.id));

  let emailsSent = 0;
  await Promise.all(
    cancelledOrders.map(async (order) => {
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
    cancelled: cancelledOrders.length,
    emailsSent,
    threshold: threshold.toISOString(),
  });
}
