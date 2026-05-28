"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface DailyBucket {
  date: string;
  orders: number;
  revenueTl: number;
}

interface StatusBucket {
  status: string;
  count: number;
}

interface AnalyticsChartsProps {
  daily: DailyBucket[];
  statusCounts: StatusBucket[];
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Bekliyor",
  PAYMENT_RECEIVED: "Ödendi",
  PROCESSING: "Hazırlanıyor",
  SHIPPED: "Kargoda",
  DELIVERED: "Teslim",
  CANCELLED: "İptal",
};

function shortDate(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

function tlFmt(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function AnalyticsCharts({
  daily,
  statusCounts,
}: AnalyticsChartsProps) {
  const tooltipBg = "rgba(255,255,255,0.95)";
  const grid = "var(--color-border)";

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <header className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold">Ciro</h2>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
            Günlük
          </p>
        </header>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={daily}
              margin={{ top: 6, right: 6, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ED1C24" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#ED1C24" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={grid} />
              <XAxis
                dataKey="date"
                tickFormatter={shortDate}
                tick={{ fontSize: 10, fill: "#888" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v: number) =>
                  v >= 1000 ? `${Math.round(v / 1000)}k ₺` : `${v} ₺`
                }
                tick={{ fontSize: 10, fill: "#888" }}
                axisLine={false}
                tickLine={false}
                width={56}
              />
              <Tooltip
                cursor={{ stroke: "#888", strokeWidth: 1 }}
                formatter={(value: number) => tlFmt(value)}
                labelFormatter={(label) => shortDate(label as string)}
                contentStyle={{
                  background: tooltipBg,
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="revenueTl"
                stroke="#ED1C24"
                strokeWidth={2}
                fill="url(#revenueFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-zinc-200 bg-white p-4 lg:col-span-2 dark:border-zinc-800 dark:bg-zinc-900">
          <header className="mb-3">
            <h2 className="text-sm font-semibold">Sipariş Sayısı</h2>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
              Günlük
            </p>
          </header>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={daily}
                margin={{ top: 6, right: 6, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={grid} />
                <XAxis
                  dataKey="date"
                  tickFormatter={shortDate}
                  tick={{ fontSize: 10, fill: "#888" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 10, fill: "#888" }}
                  axisLine={false}
                  tickLine={false}
                  width={32}
                />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.05)" }}
                  labelFormatter={(label) => shortDate(label as string)}
                  contentStyle={{
                    background: tooltipBg,
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="orders"
                  fill="#1a1a1a"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <header className="mb-3">
            <h2 className="text-sm font-semibold">Durum Dağılımı</h2>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
              Son 30 gün
            </p>
          </header>
          {statusCounts.length === 0 ? (
            <p className="text-xs text-zinc-500">Veri yok.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {statusCounts.map((s) => (
                <li key={s.status} className="flex justify-between">
                  <span className="text-zinc-700 dark:text-zinc-300">
                    {STATUS_LABEL[s.status] ?? s.status}
                  </span>
                  <span className="font-semibold tabular-nums">
                    {s.count}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
