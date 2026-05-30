import { NextResponse } from "next/server";
import { z } from "zod";
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

  // Read the existing status so we can decide whether to fire an email.
  // Status not changing → skip notification (admin tweaking notes etc.).
  const existing = await prisma.order
    .findUnique({
      where: { orderNumber },
      select: {
        id: true,
        status: true,
        items: { select: { productId: true, quantity: true } },
        user: { select: { email: true, name: true } },
        guestEmail: true,
        guestName: true,
      },
    })
    .catch(() => null);

  if (!existing) {
    return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
  }

  // Stock is held by every non-CANCELLED order, so the status change has to move
  // stock: restore it on the way INTO cancelled, re-deduct on the way OUT. Do it
  // inside one transaction with a `status: <from>` guard so two admins editing
  // the same order can't both restore (or both deduct) its stock.
  const from = existing.status;
  const to = parsed.data.status;
  try {
    const applied = await prisma.$transaction(async (tx) => {
      const res = await tx.order.updateMany({
        where: { id: existing.id, status: from },
        data: parsed.data,
      });
      if (res.count === 0) return "conflict" as const;
      if (to === "CANCELLED" && from !== "CANCELLED") {
        await restoreStock(tx, existing.items);
      } else if (from === "CANCELLED" && to !== "CANCELLED") {
        await deductStock(tx, existing.items);
      }
      return "ok" as const;
    });
    if (applied === "conflict") {
      return NextResponse.json(
        { error: "Sipariş durumu değişmiş. Sayfayı yenileyip tekrar deneyin." },
        { status: 409 },
      );
    }
  } catch (err) {
    if (err instanceof InsufficientStockError) {
      return NextResponse.json(
        {
          error: `Stok yetersiz, sipariş yeniden aktifleştirilemiyor (${err.productName}).`,
        },
        { status: 409 },
      );
    }
    console.error("ADMIN_ORDER_PATCH_ERROR", err);
    return NextResponse.json(
      { error: "Sipariş güncellenemedi" },
      { status: 500 },
    );
  }

  await logAdminAction({
    admin: { id: admin.id, email: admin.email },
    request: req,
    action: "ORDER_STATUS_PATCH",
    resource: "order",
    resourceId: orderNumber,
    detail: { from: existing.status, to: parsed.data.status },
  });

  if (existing.status !== parsed.data.status) {
    const recipient = existing.user?.email ?? existing.guestEmail ?? null;
    const recipientName =
      existing.user?.name ?? existing.guestName ?? "müşterimiz";

    if (recipient) {
      const trackingUrl = existing.user
        ? `${SITE.url}/hesabim/siparis/${orderNumber}`
        : `${SITE.url}/siparis-takibi`;

      const { subject, text, html } = buildOrderStatusEmail({
        recipientName,
        orderNumber,
        status: parsed.data.status,
        trackingUrl,
      });
      // Fire-and-forget; an email failure shouldn't fail the admin's save.
      void sendEmail({ to: recipient, subject, text, html });
    }
  }

  return NextResponse.json({ ok: true });
}
