import Link from "next/link";
import { getCurrentUser } from "@/lib/get-user";
import { prisma } from "@/lib/prisma";

export default async function AccountIndex() {
  const user = await getCurrentUser();
  if (!user) return null; // layout already redirects

  const recentOrders = await prisma.order
    .findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        orderNumber: true,
        status: true,
        totalAmount: true,
        createdAt: true,
      },
    })
    .catch(() => []);

  return (
    <div className="space-y-6 text-sm">
      <div>
        <h2 className="text-base font-semibold">Hoş Geldiniz</h2>
        <p className="mt-1 text-ink-muted">
          Siparişlerinizi takip edin, favorilerinizi saklayın, adreslerinizi
          yönetin.
        </p>
      </div>

      <dl className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-border p-4">
          <dt className="text-[10px] uppercase tracking-widest text-ink-faint">
            E-posta
          </dt>
          <dd className="mt-1 break-all">{user.email}</dd>
        </div>
        <div className="rounded-xl border border-border p-4">
          <dt className="text-[10px] uppercase tracking-widest text-ink-faint">
            Telefon
          </dt>
          <dd className="mt-1">{user.phone ?? "—"}</dd>
        </div>
      </dl>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Son Siparişler</h3>
        {recentOrders.length === 0 ? (
          <p className="text-ink-muted">
            Henüz siparişiniz yok.{" "}
            <Link href="/urunler" className="text-brand hover:underline">
              Ürünlere göz at
            </Link>
            .
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-xl border border-border">
            {recentOrders.map((o) => (
              <li
                key={o.orderNumber}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div>
                  <Link
                    href={`/hesabim/siparislerim`}
                    className="font-medium tabular-nums"
                  >
                    {o.orderNumber}
                  </Link>
                  <p className="text-xs text-ink-muted">
                    {o.createdAt.toLocaleDateString("tr-TR")} ·{" "}
                    {orderStatusLabel(o.status)}
                  </p>
                </div>
                <span className="text-sm font-semibold tabular-nums">
                  {o.totalAmount.toString()} TL
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function orderStatusLabel(status: string): string {
  return (
    {
      PENDING: "Ödeme Bekleniyor",
      PAYMENT_RECEIVED: "Ödeme Alındı",
      PROCESSING: "Hazırlanıyor",
      SHIPPED: "Kargoda",
      DELIVERED: "Teslim Edildi",
      CANCELLED: "İptal",
    }[status] ?? status
  );
}
