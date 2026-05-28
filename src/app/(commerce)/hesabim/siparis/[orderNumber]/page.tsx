import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import {
  ChevronLeft,
  MessageCircle,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
} from "lucide-react";
import { getCurrentUser } from "@/lib/get-user";
import { prisma } from "@/lib/prisma";
import { tlToKurus, formatPrice } from "@/lib/money";
import { buildWhatsappUrl, buildOrderReceiptMessage } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { CancelOrderButton } from "@/components/commerce/cancel-order-button";

interface PageProps {
  params: Promise<{ orderNumber: string }>;
}

const STATUS_FLOW = [
  { key: "PENDING", label: "Ödeme Bekleniyor", icon: Clock },
  { key: "PAYMENT_RECEIVED", label: "Ödeme Alındı", icon: CheckCircle2 },
  { key: "PROCESSING", label: "Hazırlanıyor", icon: Package },
  { key: "SHIPPED", label: "Kargoda", icon: Truck },
  { key: "DELIVERED", label: "Teslim Edildi", icon: CheckCircle2 },
] as const;

function statusIndex(status: string): number {
  const i = STATUS_FLOW.findIndex((s) => s.key === status);
  return i === -1 ? 0 : i;
}

export default async function CustomerOrderDetail({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");

  const { orderNumber } = await params;
  const order = await prisma.order
    .findFirst({
      where: { orderNumber, userId: user.id },
      include: { items: true, iban: true, whatsappLine: true },
    })
    .catch(() => null);

  if (!order) notFound();

  const items = order.items.map((i) => ({
    name: i.productName,
    quantity: i.quantity,
    image: i.productImage,
    subtotalKurus: tlToKurus(i.subtotal.toString()),
    unitPriceKurus: tlToKurus(i.salePrice.toString()),
  }));

  const totalKurus = tlToKurus(order.totalAmount.toString());
  const currentIndex = statusIndex(order.status);
  const isCancelled = order.status === "CANCELLED";

  const waMessage = order.whatsappLine
    ? buildOrderReceiptMessage({
        orderNumber: order.orderNumber,
        totalTl: formatPrice(totalKurus),
        items: items.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          unitPriceTl: formatPrice(i.subtotalKurus),
        })),
      })
    : "";
  const waHref = order.whatsappLine
    ? buildWhatsappUrl(order.whatsappLine.numberE164, waMessage)
    : null;

  return (
    <div className="space-y-6 text-sm">
      <Link
        href="/hesabim/siparislerim"
        className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-brand"
      >
        <ChevronLeft className="h-3.5 w-3.5" /> Siparişlerim
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[10px] font-mono uppercase tracking-widest text-ink-faint">
            Sipariş
          </p>
          <h2 className="text-display text-2xl tracking-tight tabular-nums">
            {order.orderNumber}
          </h2>
          <p className="text-xs text-ink-muted">
            {order.createdAt.toLocaleString("tr-TR", {
              dateStyle: "long",
              timeStyle: "short",
            })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {order.status === "PENDING" ? (
            <CancelOrderButton orderNumber={order.orderNumber} />
          ) : null}
          <Link
            href={`/hesabim/siparis/${order.orderNumber}/fatura`}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-xs font-medium hover:bg-surface-2"
          >
            Fatura / PDF
          </Link>
        </div>
      </header>

      {isCancelled ? (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          <XCircle className="h-5 w-5 shrink-0" />
          <p>Bu sipariş iptal edildi.</p>
        </div>
      ) : (
        <section>
          <ol className="flex w-full items-center">
            {STATUS_FLOW.map((step, i) => {
              const Icon = step.icon;
              const done = i <= currentIndex;
              const active = i === currentIndex;
              return (
                <li
                  key={step.key}
                  className={cn(
                    "relative flex flex-1 flex-col items-center",
                    i < STATUS_FLOW.length - 1 && "after:absolute after:top-4 after:left-1/2 after:h-0.5 after:w-full after:bg-border",
                    done && i < STATUS_FLOW.length - 1 && "after:bg-emerald-500",
                  )}
                >
                  <span
                    className={cn(
                      "relative z-10 flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                      active
                        ? "bg-brand text-white"
                        : done
                          ? "bg-emerald-500 text-white"
                          : "bg-surface-2 text-ink-faint",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span
                    className={cn(
                      "mt-1 text-center text-[10px] leading-tight",
                      active
                        ? "font-semibold text-brand"
                        : done
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-ink-faint",
                    )}
                  >
                    {step.label}
                  </span>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      <section className="rounded-xl border border-border bg-background">
        <header className="border-b border-border px-4 py-3 text-sm font-semibold">
          Ürünler ({items.reduce((s, i) => s + i.quantity, 0)} adet)
        </header>
        <ul className="divide-y divide-border">
          {items.map((item, idx) => (
            <li key={idx} className="flex gap-3 px-4 py-3">
              {item.image ? (
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-border bg-surface-2">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-14 w-14 shrink-0 rounded-md border border-dashed border-border bg-surface-2" />
              )}
              <div className="flex-1 text-sm">
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-ink-muted tabular-nums">
                  {formatPrice(item.unitPriceKurus)} × {item.quantity}
                </p>
              </div>
              <p className="self-center text-sm font-semibold tabular-nums">
                {formatPrice(item.subtotalKurus)}
              </p>
            </li>
          ))}
        </ul>
        <footer className="flex justify-between border-t border-border px-4 py-3 text-base font-semibold">
          <span>Toplam</span>
          <span className="tabular-nums">{formatPrice(totalKurus)}</span>
        </footer>
      </section>

      {order.status === "PENDING" && order.iban ? (
        <section className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
            Ödeme bekleniyor
          </p>
          <p className="text-xs text-amber-900/80 dark:text-amber-200/80">
            Aşağıdaki IBAN&apos;a havale/EFT yapın, açıklamaya{" "}
            <strong>{order.orderNumber}</strong> yazın. Dekontu WhatsApp&apos;tan
            iletmek 1 günlük süreyi kısaltır.
          </p>
          <div className="rounded-lg border border-amber-200 bg-background p-3 text-xs dark:border-amber-800">
            <p className="font-semibold">{order.iban.bankName}</p>
            <p className="font-mono tabular-nums">{order.iban.ibanNumber}</p>
            <p className="text-ink-muted">{order.iban.accountHolder}</p>
          </div>
          {waHref ? (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1ebe5d]"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              WhatsApp&apos;tan dekont gönder
            </a>
          ) : null}
        </section>
      ) : null}

      {order.receiptImageUrl ? (
        <section className="rounded-xl border border-border bg-background p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Yüklenen Dekont
          </p>
          <a
            href={order.receiptImageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div className="relative h-40 w-full overflow-hidden rounded-lg border border-border bg-surface-2">
              <Image
                src={order.receiptImageUrl}
                alt="Dekont"
                fill
                sizes="(min-width: 768px) 600px, 100vw"
                className="object-contain"
              />
            </div>
          </a>
        </section>
      ) : null}
    </div>
  );
}
