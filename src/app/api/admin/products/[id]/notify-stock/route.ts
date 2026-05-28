import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-user";
import { SITE } from "@/config/site";
import { buildStockBackInEmail, sendEmail } from "@/lib/send-email";

export const runtime = "nodejs";

// Triggered manually from the product edit page when admin restocks an
// item. Pulls all pending StockNotification rows for the product, fires
// an email to each (only ones with `email` set; phone-only subscribers
// would need a WhatsApp Business API integration — out of scope).
// Marks them as notified so re-triggering doesn't double-send.

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getCurrentUser({ admin: true });
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    select: { id: true, name: true, slug: true, stock: true },
  });
  if (!product) {
    return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
  }
  if (product.stock <= 0) {
    return NextResponse.json(
      { error: "Bildirim göndermek için önce stoğu artırın" },
      { status: 400 },
    );
  }

  const pending = await prisma.stockNotification.findMany({
    where: { productId: id, notifiedAt: null, email: { not: null } },
  });

  if (pending.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, total: 0 });
  }

  const productUrl = `${SITE.url}/urunler/${product.slug}`;
  let sent = 0;
  await Promise.all(
    pending.map(async (row) => {
      if (!row.email) return;
      const { subject, text, html } = buildStockBackInEmail({
        recipientName: row.email.split("@")[0],
        productName: product.name,
        productUrl,
      });
      const ok = await sendEmail({ to: row.email, subject, text, html });
      if (ok) sent += 1;
    }),
  );

  await prisma.stockNotification.updateMany({
    where: { productId: id, notifiedAt: null },
    data: { notifiedAt: new Date() },
  });

  return NextResponse.json({ ok: true, sent, total: pending.length });
}
