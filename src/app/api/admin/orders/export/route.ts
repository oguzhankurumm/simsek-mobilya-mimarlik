import { NextResponse } from "next/server";
import { OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-user";
import { toCsv } from "@/lib/csv";

export const runtime = "nodejs";

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Bekliyor",
  PAYMENT_RECEIVED: "Ödendi",
  PROCESSING: "Hazırlanıyor",
  SHIPPED: "Kargoda",
  DELIVERED: "Teslim",
  CANCELLED: "İptal",
};

function isOrderStatus(v: string | null): v is OrderStatus {
  return !!v && v in STATUS_LABEL;
}

// CSV export with the same filter shape as the admin orders list page —
// query param ?status= + ?q=. UTF-8 BOM so Excel renders Turkish chars
// correctly. Returns up to 10k rows to keep response time bounded.

export async function GET(req: Request) {
  const admin = await getCurrentUser({ admin: true });
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const rawStatus = searchParams.get("status");
  const status = isOrderStatus(rawStatus) ? rawStatus : undefined;
  const q = (searchParams.get("q") ?? "").trim();

  const where: Prisma.OrderWhereInput = {
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { orderNumber: { contains: q, mode: "insensitive" as const } },
            { guestName: { contains: q, mode: "insensitive" as const } },
            { guestPhone: { contains: q, mode: "insensitive" as const } },
            { guestEmail: { contains: q, mode: "insensitive" as const } },
            {
              user: {
                OR: [
                  { name: { contains: q, mode: "insensitive" as const } },
                  { email: { contains: q, mode: "insensitive" as const } },
                  { phone: { contains: q, mode: "insensitive" as const } },
                ],
              },
            },
          ],
        }
      : {}),
  };

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 10_000,
    include: {
      items: { select: { quantity: true } },
      user: { select: { name: true, email: true, phone: true } },
      iban: { select: { bankName: true } },
    },
  });

  const rows = orders.map((o) => ({
    orderNumber: o.orderNumber,
    createdAt: o.createdAt.toISOString(),
    status: STATUS_LABEL[o.status] ?? o.status,
    customerName: o.user?.name ?? o.guestName ?? "",
    customerEmail: o.user?.email ?? o.guestEmail ?? "",
    customerPhone: o.user?.phone ?? o.guestPhone ?? "",
    itemCount: o.items.reduce((s, i) => s + i.quantity, 0),
    totalAmountTl: o.totalAmount.toString(),
    iban: o.iban?.bankName ?? "",
    receiptUploaded: o.receiptImageUrl ? "evet" : "hayır",
    notes: o.notes ?? "",
  }));

  const csv = toCsv(rows, [
    { key: "orderNumber", header: "Sipariş No" },
    { key: "createdAt", header: "Tarih" },
    { key: "status", header: "Durum" },
    { key: "customerName", header: "Müşteri" },
    { key: "customerEmail", header: "E-posta" },
    { key: "customerPhone", header: "Telefon" },
    { key: "itemCount", header: "Adet" },
    { key: "totalAmountTl", header: "Toplam (TL)" },
    { key: "iban", header: "IBAN" },
    { key: "receiptUploaded", header: "Dekont" },
    { key: "notes", header: "Notlar" },
  ]);

  const today = new Date().toISOString().split("T")[0];
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="siparisler-${today}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
