import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { tlToKurus, formatPrice } from "@/lib/money";
import { AnalyticsCharts } from "@/components/admin/analytics-charts";

export const dynamic = "force-dynamic";

// Last-30-days bucketed analytics. We don't paginate or window further —
// for the launch scale (≤ a few hundred orders/month) loading everything
// is fine and the page stays cache-friendly with `force-dynamic` + a CDN
// edge.

const DAYS = 30;

interface DailyBucket {
  date: string;
  orders: number;
  revenueKurus: number;
}

function startOfDayUTC(d: Date): Date {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

export default async function AnalyticsPage() {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - DAYS);
  since.setUTCHours(0, 0, 0, 0);

  const [orders, statusCounts] = await Promise.all([
    prisma.order
      .findMany({
        where: {
          createdAt: { gte: since },
          status: { not: "CANCELLED" },
        },
        select: { createdAt: true, totalAmount: true },
      })
      .catch(() => []),
    prisma.order
      .groupBy({
        by: ["status"],
        where: { createdAt: { gte: since } },
        _count: { _all: true },
      })
      .catch(() => [] as Array<{ status: OrderStatus; _count: { _all: number } }>),
  ]);

  // Bucket into days.
  const buckets = new Map<string, DailyBucket>();
  for (let i = 0; i < DAYS; i++) {
    const d = new Date(since);
    d.setUTCDate(since.getUTCDate() + i);
    const key = d.toISOString().split("T")[0];
    buckets.set(key, { date: key, orders: 0, revenueKurus: 0 });
  }
  for (const o of orders) {
    const key = startOfDayUTC(o.createdAt).toISOString().split("T")[0];
    const bucket = buckets.get(key);
    if (!bucket) continue;
    bucket.orders += 1;
    bucket.revenueKurus += tlToKurus(o.totalAmount.toString());
  }

  const daily = Array.from(buckets.values());
  const totalOrders = daily.reduce((s, d) => s + d.orders, 0);
  const totalRevenue = daily.reduce((s, d) => s + d.revenueKurus, 0);
  const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
          Son {DAYS} gün
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Analitik
        </h1>
      </header>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <MetricCard label="Toplam Sipariş" value={String(totalOrders)} />
        <MetricCard
          label="Toplam Ciro"
          value={formatPrice(totalRevenue)}
        />
        <MetricCard
          label="Ortalama Sepet"
          value={formatPrice(Math.round(avgOrder))}
        />
      </div>

      <AnalyticsCharts
        daily={daily.map((d) => ({
          date: d.date,
          orders: d.orders,
          revenueTl: d.revenueKurus / 100,
        }))}
        statusCounts={statusCounts.map((s) => ({
          status: s.status,
          count: s._count._all,
        }))}
      />
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-[10px] uppercase tracking-widest text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
