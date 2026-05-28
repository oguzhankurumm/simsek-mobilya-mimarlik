import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { tlToKurus, formatPrice } from "@/lib/money";
import { buildWhatsappUrl } from "@/lib/whatsapp";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { ReceiptUpload } from "@/components/admin/receipt-upload";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ orderNumber: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { orderNumber } = await params;

  const order = await prisma.order
    .findUnique({
      where: { orderNumber },
      include: {
        items: true,
        user: true,
        iban: true,
        whatsappLine: true,
      },
    })
    .catch(() => null);

  if (!order) notFound();

  const customerPhone =
    order.user?.phone ?? order.guestPhone ?? "";
  const customerName =
    order.user?.name ?? order.guestName ?? "(Konuk)";
  const waUrl = customerPhone
    ? buildWhatsappUrl(
        customerPhone,
        `Merhaba ${customerName}, ${order.orderNumber} numaralı siparişinizle ilgili...`,
      )
    : null;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/dashboard/orders"
        className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
      >
        <ChevronLeft className="h-3.5 w-3.5" /> Tüm Siparişler
      </Link>

      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
            Sipariş
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
            {order.orderNumber}
          </h1>
          <p className="text-xs text-zinc-500">
            {order.createdAt.toLocaleString("tr-TR", {
              dateStyle: "long",
              timeStyle: "short",
            })}
          </p>
        </div>
        {waUrl ? (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-[#25D366] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1ebe5d]"
          >
            Müşteriye WhatsApp
          </a>
        ) : null}
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[2fr_1fr]">
        <section className="space-y-6">
          <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <header className="border-b border-zinc-200 px-5 py-3 text-sm font-semibold dark:border-zinc-800">
              Ürünler
            </header>
            <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {order.items.map((item) => (
                <li key={item.id} className="flex gap-3 px-5 py-3">
                  {item.productImage ? (
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800">
                      <Image
                        src={item.productImage}
                        alt={item.productName}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                  ) : null}
                  <div className="flex-1 text-sm">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-xs text-zinc-500 tabular-nums">
                      {formatPrice(tlToKurus(item.salePrice.toString()))} ×{" "}
                      {item.quantity} adet
                    </p>
                  </div>
                  <p className="text-sm font-semibold tabular-nums">
                    {formatPrice(tlToKurus(item.subtotal.toString()))}
                  </p>
                </li>
              ))}
            </ul>
            <footer className="flex justify-between border-t border-zinc-200 px-5 py-3 text-sm dark:border-zinc-800">
              <span className="text-zinc-500">Toplam</span>
              <span className="text-base font-semibold tabular-nums">
                {formatPrice(tlToKurus(order.totalAmount.toString()))}
              </span>
            </footer>
          </div>

          {order.notes ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-5 text-sm dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500">
                Notlar
              </p>
              <p className="mt-2 whitespace-pre-line">{order.notes}</p>
            </div>
          ) : null}
        </section>

        <aside className="space-y-4 text-sm">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500">
              Durum
            </p>
            <OrderStatusForm
              orderId={order.id}
              orderNumber={order.orderNumber}
              currentStatus={order.status}
            />
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="mb-3 text-[10px] uppercase tracking-widest text-zinc-500">
              Dekont
            </p>
            <ReceiptUpload
              orderNumber={order.orderNumber}
              currentUrl={order.receiptImageUrl}
            />
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500">
              Müşteri
            </p>
            <p className="mt-2 font-medium">{customerName}</p>
            {order.user?.email ? (
              <p className="text-xs text-zinc-500">{order.user.email}</p>
            ) : null}
            {customerPhone ? (
              <p className="text-xs text-zinc-500">{customerPhone}</p>
            ) : null}
          </div>

          {order.iban ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500">
                Ödeme IBAN&apos;ı
              </p>
              <p className="mt-2 font-medium">{order.iban.bankName}</p>
              <p className="font-mono text-xs text-zinc-600 dark:text-zinc-400">
                {order.iban.ibanNumber}
              </p>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
