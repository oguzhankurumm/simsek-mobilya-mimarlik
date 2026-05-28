import Link from "next/link";
import { OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { tlToKurus, formatPrice } from "@/lib/money";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Bekliyor",
  PAYMENT_RECEIVED: "Ödendi",
  PROCESSING: "Hazırlanıyor",
  SHIPPED: "Kargoda",
  DELIVERED: "Teslim",
  CANCELLED: "İptal",
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-900",
  PAYMENT_RECEIVED: "bg-blue-100 text-blue-900",
  PROCESSING: "bg-violet-100 text-violet-900",
  SHIPPED: "bg-cyan-100 text-cyan-900",
  DELIVERED: "bg-emerald-100 text-emerald-900",
  CANCELLED: "bg-zinc-100 text-zinc-900",
};

function isOrderStatus(v: string | undefined): v is OrderStatus {
  return !!v && v in STATUS_LABEL;
}

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

const orderListArgs = {
  orderBy: { createdAt: "desc" },
  include: {
    user: { select: { name: true, email: true } },
    items: { select: { quantity: true } },
  },
  take: 100,
} satisfies Prisma.OrderFindManyArgs;
type OrderListRow = Prisma.OrderGetPayload<typeof orderListArgs>;

export default async function OrdersListPage({ searchParams }: PageProps) {
  const { status: rawStatus } = await searchParams;
  const status = isOrderStatus(rawStatus) ? rawStatus : undefined;
  const where: Prisma.OrderWhereInput = status ? { status } : {};
  let orders: OrderListRow[] = [];
  try {
    orders = await prisma.order.findMany({ ...orderListArgs, where });
  } catch {
    orders = [];
  }

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
            Tüm Siparişler
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Siparişler
          </h1>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Link
            href="/admin/dashboard/orders"
            className={`rounded-full px-3 py-1 text-xs ${!status ? "bg-zinc-900 text-white" : "border border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"}`}
          >
            Tümü
          </Link>
          {Object.entries(STATUS_LABEL).map(([key, label]) => (
            <Link
              key={key}
              href={`/admin/dashboard/orders?status=${key}`}
              className={`rounded-full px-3 py-1 text-xs ${status === key ? "bg-zinc-900 text-white" : "border border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"}`}
            >
              {label}
            </Link>
          ))}
        </div>
      </header>

      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {orders.length === 0 ? (
          <p className="p-5 text-sm text-zinc-500">Bu filtreye uygun sipariş yok.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-200 text-left text-[10px] uppercase tracking-widest text-zinc-500 dark:border-zinc-800">
              <tr>
                <th className="px-4 py-2.5">Sipariş No</th>
                <th className="px-4 py-2.5">Müşteri</th>
                <th className="px-4 py-2.5">Adet</th>
                <th className="px-4 py-2.5">Tutar</th>
                <th className="px-4 py-2.5">Durum</th>
                <th className="px-4 py-2.5">Tarih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {orders.map((o) => {
                const itemCount = o.items.reduce((s, i) => s + i.quantity, 0);
                const customer =
                  o.user?.name ?? o.guestName ?? "(Konuk)";
                return (
                  <tr
                    key={o.orderNumber}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/dashboard/orders/${o.orderNumber}`}
                        className="font-medium tabular-nums hover:underline"
                      >
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                      <div>{customer}</div>
                      <div className="text-xs text-zinc-500">
                        {o.user?.email ?? o.guestPhone ?? "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3 tabular-nums">{itemCount}</td>
                    <td className="px-4 py-3 font-semibold tabular-nums">
                      {formatPrice(tlToKurus(o.totalAmount.toString()))}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] ${STATUS_COLOR[o.status] ?? "bg-zinc-100"}`}
                      >
                        {STATUS_LABEL[o.status] ?? o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500 tabular-nums">
                      {o.createdAt.toLocaleString("tr-TR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
