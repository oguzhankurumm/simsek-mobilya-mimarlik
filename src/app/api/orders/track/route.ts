import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidOrderNumberFormat } from "@/lib/order-number";
import { tlToKurus } from "@/lib/money";
import { rateLimit, clientIpFromRequest } from "@/lib/rate-limit";

export const runtime = "nodejs";

const HOUR_MS = 60 * 60 * 1000;

// Public tracking endpoint. Requires both orderNumber (8-char random) AND
// phoneLast4 to defeat enumeration (T20). Logged-in users with the order on
// their account also see it via /hesabim/siparislerim.

export async function GET(req: Request) {
  // phoneLast4 is only 10,000 possibilities, so a known/leaked order number
  // would otherwise be brute-forceable. Rate limit per IP and per order number
  // (uniform 404 on the per-order cap so it doesn't reveal the order exists).
  const ip = clientIpFromRequest(req);
  if (!(await rateLimit(`track:ip:${ip}`, 20, HOUR_MS)).allowed) {
    return NextResponse.json(
      { error: "Çok fazla deneme. Lütfen biraz bekleyin." },
      { status: 429 },
    );
  }

  const { searchParams } = new URL(req.url);
  const orderNumber = (searchParams.get("orderNumber") ?? "").toUpperCase();
  const phoneLast4 = searchParams.get("phoneLast4") ?? "";

  if (!isValidOrderNumberFormat(orderNumber)) {
    return NextResponse.json(
      { error: "Geçersiz sipariş numarası" },
      { status: 400 },
    );
  }
  if (!/^\d{4}$/.test(phoneLast4)) {
    return NextResponse.json(
      { error: "Telefon son 4 hane zorunludur" },
      { status: 400 },
    );
  }

  if (!(await rateLimit(`track:order:${orderNumber}`, 10, HOUR_MS)).allowed) {
    return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
  }

  const order = await prisma.order
    .findUnique({
      where: { orderNumber },
      include: {
        items: { select: { quantity: true } },
        user: { select: { phone: true } },
      },
    })
    .catch(() => null);

  if (!order) {
    return NextResponse.json(
      { error: "Sipariş bulunamadı" },
      { status: 404 },
    );
  }

  const phoneOnFile = order.user?.phone ?? order.guestPhone ?? "";
  const last4OnFile = phoneOnFile.replace(/\D+/g, "").slice(-4);
  if (last4OnFile !== phoneLast4) {
    return NextResponse.json(
      { error: "Sipariş bulunamadı" },
      { status: 404 },
    );
  }

  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);

  return NextResponse.json({
    orderNumber: order.orderNumber,
    status: order.status,
    totalAmountKurus: tlToKurus(order.totalAmount.toString()),
    createdAt: order.createdAt.toISOString(),
    itemCount,
  });
}
