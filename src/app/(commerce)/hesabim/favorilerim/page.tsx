import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Heart } from "lucide-react";
import { getCurrentUser } from "@/lib/get-user";
import { prisma } from "@/lib/prisma";
import { tlToKurus, formatPrice } from "@/lib/money";
import { WishlistButton } from "@/components/commerce/wishlist-button";
import { WishlistSync } from "@/components/commerce/wishlist-sync";

export default async function WishlistPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");

  const rows = await prisma.wishlist
    .findMany({
      where: { userId: user.id },
      include: {
        product: {
          include: {
            category: { select: { name: true } },
            images: { where: { isMain: true }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
    .catch(() => []);

  return (
    <div className="space-y-4 text-sm">
      <WishlistSync />
      <h2 className="text-base font-semibold">Favorilerim</h2>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-3 py-12 text-center text-ink-muted">
          <Heart className="h-8 w-8 text-ink-faint" strokeWidth={1.5} />
          <p>Henüz favori ürününüz yok.</p>
          <Link
            href="/urunler"
            className="rounded-full bg-brand px-5 py-2 text-xs font-semibold text-white hover:bg-brand/90"
          >
            Ürünlere göz at
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {rows.map((row) => {
            const p = row.product;
            const image = p.images[0]?.url ?? "/placeholder-product.svg";
            return (
              <li
                key={row.id}
                className="flex gap-3 rounded-xl border border-border p-3"
              >
                <Link
                  href={`/urunler/${p.slug}`}
                  className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-border bg-surface-2"
                >
                  <Image
                    src={image}
                    alt={p.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </Link>
                <div className="flex flex-1 flex-col justify-between gap-1">
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-ink-faint">
                      {p.category.name}
                    </p>
                    <Link
                      href={`/urunler/${p.slug}`}
                      className="text-sm font-medium leading-snug"
                    >
                      {p.name}
                    </Link>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-semibold tabular-nums">
                      {formatPrice(tlToKurus(p.salePrice.toString()))}
                    </span>
                    <WishlistButton productId={p.id} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
