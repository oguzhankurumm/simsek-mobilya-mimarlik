import Link from "next/link";
import { OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { tlToKurus, formatPrice } from "@/lib/money";
import { AdminOrderSearch } from "@/components/admin/order-search";
import { OrderBulkTable } from "@/components/admin/order-bulk-table";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Bekliyor",
  PAYMENT_RECEIVED: "Ödendi",
  PROCESSING: "Hazırlanıyor",
  SHIPPED: "Kargoda",
  DELIVERED: "Teslim",
  CANCELLED: "İptal",
};

function isOrderStatus(v: string | undefined): v is OrderStatus {
  return !!v && v in STATUS_LABEL;
}

interface PageProps {
  searchParams: Promise<{ status?: string; q?: string }>;
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
  const { status: rawStatus, q } = await searchParams;
  const status = isOrderStatus(rawStatus) ? rawStatus : undefined;
  const queryTerm = (q ?? "").trim();

  const where: Prisma.OrderWhereInput = {
    ...(status ? { status } : {}),
    ...(queryTerm
      ? {
          OR: [
            { orderNumber: { contains: queryTerm, mode: "insensitive" as const } },
            { guestName: { contains: queryTerm, mode: "insensitive" as const } },
            { guestPhone: { contains: queryTerm, mode: "insensitive" as const } },
            { guestEmail: { contains: queryTerm, mode: "insensitive" as const } },
            {
              user: {
                OR: [
                  { name: { contains: queryTerm, mode: "insensitive" as const } },
                  { email: { contains: queryTerm, mode: "insensitive" as const } },
                  { phone: { contains: queryTerm, mode: "insensitive" as const } },
                ],
              },
            },
          ],
        }
      : {}),
  };

  let orders: OrderListRow[] = [];
  try {
    orders = await prisma.order.findMany({ ...orderListArgs, where });
  } catch {
    orders = [];
  }

  return (
    <div className="space-y-6">
      <header className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
              {queryTerm ? `Arama: "${queryTerm}"` : "Tüm Siparişler"}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Siparişler
              {orders.length > 0 ? (
                <span className="ml-2 text-sm font-normal text-zinc-500 tabular-nums">
                  ({orders.length})
                </span>
              ) : null}
            </h1>
          </div>
          <AdminOrderSearch />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Link
            href={`/admin/dashboard/orders${queryTerm ? `?q=${encodeURIComponent(queryTerm)}` : ""}`}
            className={`rounded-full px-3 py-1 text-xs ${!status ? "bg-zinc-900 text-white" : "border border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"}`}
          >
            Tümü
          </Link>
          {Object.entries(STATUS_LABEL).map(([key, label]) => {
            const params = new URLSearchParams();
            params.set("status", key);
            if (queryTerm) params.set("q", queryTerm);
            return (
              <Link
                key={key}
                href={`/admin/dashboard/orders?${params}`}
                className={`rounded-full px-3 py-1 text-xs ${status === key ? "bg-zinc-900 text-white" : "border border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"}`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </header>

      <OrderBulkTable
        orders={orders.map((o) => ({
          orderNumber: o.orderNumber,
          status: o.status,
          totalAmountFormatted: formatPrice(tlToKurus(o.totalAmount.toString())),
          customerName: o.user?.name ?? o.guestName ?? "(Konuk)",
          customerEmail: o.user?.email ?? o.guestEmail ?? o.guestPhone ?? "—",
          itemCount: o.items.reduce((s, i) => s + i.quantity, 0),
          createdAtIso: o.createdAt.toISOString(),
        }))}
        exportHref={`/api/admin/orders/export${
          status || queryTerm
            ? `?${new URLSearchParams({
                ...(status ? { status } : {}),
                ...(queryTerm ? { q: queryTerm } : {}),
              })}`
            : ""
        }`}
      />
    </div>
  );
}
