import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function StockNotificationsAdminPage() {
  // Group by productId so admins see "X people waiting on this product"
  // at a glance. notifiedAt = null means still pending.
  const rows = await prisma.stockNotification
    .findMany({
      where: { notifiedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            stock: true,
            active: true,
          },
        },
      },
    })
    .catch(() => []);

  const grouped = new Map<
    string,
    {
      productId: string;
      productName: string;
      productSlug: string;
      productStock: number;
      productActive: boolean;
      subscribers: { email: string | null; phone: string | null; createdAt: Date }[];
    }
  >();

  for (const row of rows) {
    const key = row.productId;
    const bucket = grouped.get(key);
    if (bucket) {
      bucket.subscribers.push({
        email: row.email,
        phone: row.phone,
        createdAt: row.createdAt,
      });
    } else {
      grouped.set(key, {
        productId: row.productId,
        productName: row.product.name,
        productSlug: row.product.slug,
        productStock: row.product.stock,
        productActive: row.product.active,
        subscribers: [
          {
            email: row.email,
            phone: row.phone,
            createdAt: row.createdAt,
          },
        ],
      });
    }
  }
  const groups = Array.from(grouped.values()).sort(
    (a, b) => b.subscribers.length - a.subscribers.length,
  );

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
          Bekleyen Stok Bildirimleri
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Stok Bildirimleri
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Müşteriler stoğu olmayan ürünler için bildirim talep etti. Ürünü
          tekrar stoklandığında ürün düzenleme sayfası üzerinden{" "}
          <strong>Bekleyen abonelere e-posta gönder</strong> butonuna basın.
        </p>
      </header>

      {groups.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500 dark:border-zinc-700">
          Bekleyen bildirim yok.
        </div>
      ) : (
        <ul className="space-y-3">
          {groups.map((group) => (
            <li
              key={group.productId}
              className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <Link
                    href={`/admin/dashboard/products/${group.productId}`}
                    className="text-sm font-semibold hover:underline"
                  >
                    {group.productName}
                  </Link>
                  <p className="text-xs text-zinc-500">
                    {group.subscribers.length} bekleyen abone
                    {group.productActive ? "" : " · ÜRÜN PASIF"}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${
                    group.productStock > 0
                      ? "bg-emerald-100 text-emerald-900"
                      : "bg-amber-100 text-amber-900"
                  }`}
                >
                  Stok: {group.productStock}
                </span>
              </div>
              <details className="mt-3">
                <summary className="cursor-pointer text-xs text-zinc-500 hover:text-zinc-900">
                  Aboneleri göster
                </summary>
                <ul className="mt-2 divide-y divide-zinc-100 text-xs dark:divide-zinc-800">
                  {group.subscribers.map((sub, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between gap-2 py-1.5"
                    >
                      <span>
                        {sub.email ?? sub.phone ?? "—"}
                      </span>
                      <span className="text-zinc-400">
                        {sub.createdAt.toLocaleDateString("tr-TR")}
                      </span>
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
