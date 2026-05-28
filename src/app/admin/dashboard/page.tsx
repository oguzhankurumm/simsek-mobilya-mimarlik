import Link from "next/link";
import {
  ShoppingCart,
  TrendingUp,
  Package,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { tlToKurus, formatPrice } from "@/lib/money";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Ödeme Bekleniyor",
  PAYMENT_RECEIVED: "Ödeme Alındı",
  PROCESSING: "Hazırlanıyor",
  SHIPPED: "Kargoda",
  DELIVERED: "Teslim Edildi",
  CANCELLED: "İptal",
};

type RecentOrder = {
  orderNumber: string;
  status: string;
  totalAmount: { toString: () => string };
  createdAt: Date;
  guestName: string | null;
  user: { name: string } | null;
};

async function getStats(): Promise<{
  pendingCount: number;
  todayCount: number;
  totalCount: number;
  customerCount: number;
  productCount: number;
  recent: RecentOrder[];
}> {
  try {
    const [pendingCount, todayCount, totalCount, customerCount, productCount, recent] = await Promise.all([
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.order.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.product.count({ where: { active: true } }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          orderNumber: true,
          status: true,
          totalAmount: true,
          createdAt: true,
          guestName: true,
          user: { select: { name: true } },
        },
      }),
    ]);
    return { pendingCount, todayCount, totalCount, customerCount, productCount, recent };
  } catch {
    return {
      pendingCount: 0,
      todayCount: 0,
      totalCount: 0,
      customerCount: 0,
      productCount: 0,
      recent: [],
    };
  }
}

export default async function DashboardPage() {
  const s = await getStats();

  const cards = [
    {
      label: "Bekleyen Sipariş",
      value: s.pendingCount,
      icon: ShoppingCart,
      href: "/admin/dashboard/orders?status=PENDING",
    },
    {
      label: "Bugünkü Sipariş",
      value: s.todayCount,
      icon: TrendingUp,
      href: "/admin/dashboard/orders",
    },
    {
      label: "Aktif Ürün",
      value: s.productCount,
      icon: Package,
      href: "/admin/dashboard/products",
    },
    {
      label: "Müşteri",
      value: s.customerCount,
      icon: Users,
      href: "/admin/dashboard/customers",
    },
  ];

  return (
    <div className="space-y-8">
      <header>
        <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
          Genel Bakış
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Dashboard</h1>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.label}
              href={c.href}
              className="group rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-300"
            >
              <Icon className="h-5 w-5 text-zinc-500" />
              <p className="mt-3 text-xs uppercase tracking-wide text-zinc-500">
                {c.label}
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {c.value}
              </p>
            </Link>
          );
        })}
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <header className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <h2 className="text-sm font-semibold">Son Siparişler</h2>
          <Link
            href="/admin/dashboard/orders"
            className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
          >
            Tümünü Gör →
          </Link>
        </header>
        {s.recent.length === 0 ? (
          <p className="p-5 text-sm text-zinc-500">Henüz sipariş yok.</p>
        ) : (
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {s.recent.map((o) => (
              <li
                key={o.orderNumber}
                className="flex items-center justify-between gap-4 px-5 py-3"
              >
                <div>
                  <Link
                    href={`/admin/dashboard/orders/${o.orderNumber}`}
                    className="text-sm font-medium tabular-nums hover:underline"
                  >
                    {o.orderNumber}
                  </Link>
                  <p className="text-xs text-zinc-500">
                    {o.user?.name ?? o.guestName ?? "—"} ·{" "}
                    {o.createdAt.toLocaleString("tr-TR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold tabular-nums">
                    {formatPrice(tlToKurus(o.totalAmount.toString()))}
                  </p>
                  <p className="text-[10px] text-zinc-500">
                    {STATUS_LABEL[o.status] ?? o.status}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
