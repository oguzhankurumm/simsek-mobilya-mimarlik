import { NextResponse } from "next/server";
import { z } from "zod";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-user";
import { SITE } from "@/config/site";
import { buildOrderStatusEmail, sendEmail } from "@/lib/send-email";
import { logAdminAction } from "@/lib/audit-log";
import {
  restoreStock,
  deductStock,
  InsufficientStockError,
} from "@/lib/order-stock";

export const runtime = "nodejs";

const bulkSchema = z.object({
  orderNumbers: z.array(z.string().min(1)).min(1).max(100),
  status: z.nativeEnum(OrderStatus),
  notifyCustomers: z.boolean().optional().default(true),
});

export async function POST(req: Request) {
  const admin = await getCurrentUser({ admin: true });
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = bulkSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
  }
  const { orderNumbers, status, notifyCustomers } = parsed.data;

  // Load before-state (with items) so we can move stock and notify only the
  // rows we actually change.
  const existing = await prisma.order.findMany({
    where: { orderNumber: { in: orderNumbers } },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      items: { select: { productId: true, quantity: true } },
      guestName: true,
      guestEmail: true,
      user: { select: { name: true, email: true } },
      userId: true,
    },
  });

  // Apply each transition under a per-row `status: <from>` guard inside one
  // transaction, moving stock the same way the single-order PATCH does (restore
  // into CANCELLED, re-deduct out of it). A row already at the target status, or
  // raced by another admin, is skipped — never double-moved.
  let transitioned: typeof existing = [];
  try {
    transitioned = await prisma.$transaction(
      async (tx) => {
        const done: typeof existing = [];
        for (const o of existing) {
          if (o.status === status) continue;
          const res = await tx.order.updateMany({
            where: { id: o.id, status: o.status },
            data: { status },
          });
          if (res.count === 0) continue;
          if (status === "CANCELLED") {
            await restoreStock(tx, o.items);
          } else if (o.status === "CANCELLED") {
            await deductStock(tx, o.items);
          }
          done.push(o);
        }
        return done;
      },
      { timeout: 30_000 },
    );
  } catch (err) {
    if (err instanceof InsufficientStockError) {
      return NextResponse.json(
        {
          error: `Stok yetersiz, sipariş yeniden aktifleştirilemiyor (${err.productName}).`,
        },
        { status: 409 },
      );
    }
    console.error("ADMIN_ORDER_BULK_ERROR", err);
    return NextResponse.json(
      { error: "Siparişler güncellenemedi" },
      { status: 500 },
    );
  }

  let notified = 0;
  if (notifyCustomers) {
    await Promise.all(
      transitioned.map(async (o) => {
        const recipient = o.user?.email ?? o.guestEmail ?? null;
        if (!recipient) return;
        const name = o.user?.name ?? o.guestName ?? "müşterimiz";
        const trackingUrl = o.userId
          ? `${SITE.url}/hesabim/siparis/${o.orderNumber}`
          : `${SITE.url}/siparis-takibi`;
        const { subject, text, html } = buildOrderStatusEmail({
          recipientName: name,
          orderNumber: o.orderNumber,
          status,
          trackingUrl,
        });
        const ok = await sendEmail({
          to: recipient,
          subject,
          text,
          html,
        });
        if (ok) notified += 1;
      }),
    );
  }

  await logAdminAction({
    admin: { id: admin.id, email: admin.email },
    request: req,
    action: "ORDER_BULK_PATCH",
    resource: "order",
    detail: {
      newStatus: status,
      count: transitioned.length,
      notified,
      notifyCustomers,
    },
  });

  return NextResponse.json({
    ok: true,
    updated: transitioned.length,
    notified,
  });
}
