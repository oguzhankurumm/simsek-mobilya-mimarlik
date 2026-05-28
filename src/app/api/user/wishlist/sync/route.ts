import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-user";

export const runtime = "nodejs";

// One-shot sync after login. Client posts its localStorage product ids;
// server upserts them into the Wishlist table (skipping duplicates), then
// returns the merged authoritative list so client can replace its store.

const bodySchema = z.object({
  productIds: z.array(z.string()).max(200),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
  }

  // Filter to product ids that actually exist + are active, so we don't
  // pollute the table with stale local ids.
  const validProducts = await prisma.product.findMany({
    where: { id: { in: parsed.data.productIds }, active: true },
    select: { id: true },
  });
  const validIds = new Set(validProducts.map((p) => p.id));

  if (validIds.size > 0) {
    // createMany + skipDuplicates honours the @@unique([userId, productId])
    // constraint without throwing on collisions.
    await prisma.wishlist.createMany({
      data: Array.from(validIds).map((productId) => ({
        userId: user.id,
        productId,
      })),
      skipDuplicates: true,
    });
  }

  const merged = await prisma.wishlist.findMany({
    where: { userId: user.id },
    select: { productId: true },
  });

  return NextResponse.json({
    productIds: merged.map((r) => r.productId),
  });
}
