import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tlToKurus } from "@/lib/money";

export const runtime = "nodejs";

// Public single-product fetch used by the "Yeniden Sipariş Ver" button to
// re-hydrate cart entries with current prices + stock + image. The PDP
// itself doesn't use this endpoint (it's server-rendered with
// getProductBySlug); this is purely for client-driven cart restoration.

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const product = await prisma.product
    .findUnique({
      where: { id, active: true },
      include: {
        images: { where: { isMain: true }, take: 1 },
        category: { select: { slug: true } },
      },
    })
    .catch(() => null);
  if (!product) {
    return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
  }
  return NextResponse.json({
    id: product.id,
    name: product.name,
    slug: product.slug,
    stock: product.stock,
    brand: product.brand,
    categorySlug: product.category.slug,
    salePriceKurus: tlToKurus(product.salePrice.toString()),
    originalPriceKurus: tlToKurus(product.originalPrice.toString()),
    image: product.images[0]?.url ?? "",
  });
}
