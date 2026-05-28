import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getCurrentUser } from "@/lib/get-user";
import { prisma } from "@/lib/prisma";
import { tlToKurus } from "@/lib/money";
import { formatPrice } from "@/lib/money";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Ödeme Bekleniyor",
  PAYMENT_RECEIVED: "Ödeme Alındı",
  PROCESSING: "Hazırlanıyor",
  SHIPPED: "Kargoda",
  DELIVERED: "Teslim Edildi",
  CANCELLED: "İptal",
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  PAYMENT_RECEIVED:
    "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200",
  PROCESSING:
    "bg-violet-100 text-violet-900 dark:bg-violet-950 dark:text-violet-200",
  SHIPPED: "bg-cyan-100 text-cyan-900 dark:bg-cyan-950 dark:text-cyan-200",
  DELIVERED:
    "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  CANCELLED: "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-300",
};

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");

  const orders = await prisma.order
    .findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { items: { take: 1 } },
    })
    .catch(() => []);

  if (orders.length === 0) {
    return (
      <div className="space-y-3 text-sm">
        <h2 className="text-base font-semibold">Siparişlerim</h2>
        <p className="text-ink-muted">
          Henüz siparişiniz yok.{" "}
          <Link href="/urunler" className="text-brand hover:underline">
            Ürünlere göz at
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 text-sm">
      <h2 className="text-base font-semibold">Siparişlerim</h2>
      <ul className="divide-y divide-border rounded-xl border border-border">
        {orders.map((order) => (
          <li key={order.orderNumber}>
            <Link
              href={`/hesabim/siparis/${order.orderNumber}`}
              className="flex items-start justify-between gap-3 px-4 py-4 transition-colors hover:bg-surface-2"
            >
              <div className="space-y-1">
                <p className="font-semibold tabular-nums">
                  {order.orderNumber}
                </p>
                <p className="text-xs text-ink-muted">
                  {order.createdAt.toLocaleString("tr-TR", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLOR[order.status] ?? "bg-zinc-100"}`}
                >
                  {STATUS_LABEL[order.status] ?? order.status}
                </span>
              </div>
              <div className="text-right">
                <p className="text-base font-semibold tabular-nums">
                  {formatPrice(tlToKurus(order.totalAmount.toString()))}
                </p>
                <ChevronRight className="ml-auto mt-1 h-4 w-4 text-ink-faint" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
