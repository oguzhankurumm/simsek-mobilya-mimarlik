import { NextResponse } from "next/server";
import { z } from "zod";
import { OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-user";
import { SITE } from "@/config/site";
import { buildOrderStatusEmail, sendEmail } from "@/lib/send-email";

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

  // Load before-state so we can decide which rows actually need a notification.
  const existing = await prisma.order.findMany({
    where: { orderNumber: { in: orderNumbers } },
    select: {
      orderNumber: true,
      status: true,
      guestName: true,
      guestEmail: true,
      user: { select: { name: true, email: true } },
      userId: true,
    },
  });

  const updated = await prisma.order.updateMany({
    where: { orderNumber: { in: orderNumbers } },
    data: { status },
  });

  let notified = 0;
  if (notifyCustomers) {
    await Promise.all(
      existing
        .filter((o) => o.status !== status)
        .map(async (o) => {
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

  return NextResponse.json({
    ok: true,
    updated: updated.count,
    notified,
  });
}

// Avoid the unused-import lint when Prisma type is type-only.
type _Unused = Prisma.OrderWhereInput;
