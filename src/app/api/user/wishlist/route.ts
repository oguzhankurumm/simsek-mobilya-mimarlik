import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-user";

export const runtime = "nodejs";

// GET — return the user's wishlist (product ids + snapshot fields needed
// for the favorites list view).
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ items: [] }, { status: 200 });

  const rows = await prisma.wishlist.findMany({
    where: { userId: user.id },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          salePrice: true,
          originalPrice: true,
          stock: true,
          brand: true,
          category: { select: { name: true } },
          images: { where: { isMain: true }, take: 1 },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    items: rows.map((row) => ({
      productId: row.productId,
      product: {
        id: row.product.id,
        name: row.product.name,
        slug: row.product.slug,
        brand: row.product.brand,
        categoryName: row.product.category.name,
        salePriceTl: row.product.salePrice.toString(),
        originalPriceTl: row.product.originalPrice.toString(),
        stock: row.product.stock,
        image: row.product.images[0]?.url ?? "",
      },
    })),
  });
}

// POST — toggle a product in the wishlist (idempotent — unique constraint
// catches duplicates).
const postSchema = z.object({ productId: z.string().min(1) });

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Önce giriş yapın" },
      { status: 401 },
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = postSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
  }

  await prisma.wishlist
    .create({
      data: { userId: user.id, productId: parsed.data.productId },
    })
    .catch(() => undefined); // Duplicate is fine.

  return NextResponse.json({ ok: true });
}

// DELETE — remove a product from the wishlist.
export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Önce giriş yapın" },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  if (!productId) {
    return NextResponse.json(
      { error: "productId zorunlu" },
      { status: 400 },
    );
  }

  await prisma.wishlist
    .deleteMany({
      where: { userId: user.id, productId },
    })
    .catch(() => undefined);

  return NextResponse.json({ ok: true });
}
