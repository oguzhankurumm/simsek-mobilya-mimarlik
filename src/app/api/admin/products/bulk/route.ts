import { NextResponse } from "next/server";
import { z } from "zod";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-user";
import { logAdminAction } from "@/lib/audit-log";

export const runtime = "nodejs";

const bulkSchema = z.object({
  action: z.enum(["delete", "activate", "deactivate", "feature", "unfeature"]),
  productIds: z.array(z.string().min(1)).min(1).max(200),
});

export async function POST(req: Request) {
  const admin = await getCurrentUser({ admin: true });
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = bulkSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
  }
  const { action, productIds } = parsed.data;

  if (action === "delete") {
    // Pull blob URLs for cleanup before the cascade nukes ProductImage.
    const images = await prisma.productImage.findMany({
      where: { productId: { in: productIds } },
      select: { url: true },
    });
    await prisma.product.deleteMany({ where: { id: { in: productIds } } });
    await Promise.all(
      images
        .filter((img) =>
          img.url.includes(".public.blob.vercel-storage.com"),
        )
        .map((img) =>
          del(img.url, {
            token: process.env.BLOB_READ_WRITE_TOKEN,
          }).catch(() => undefined),
        ),
    );
    await logAdminAction({
      admin: { id: admin.id, email: admin.email },
      request: req,
      action: "PRODUCT_BULK",
      resource: "product",
      detail: { action: "delete", count: productIds.length },
    });
    return NextResponse.json({ ok: true, deleted: productIds.length });
  }

  const data: Record<string, boolean> = {};
  switch (action) {
    case "activate":
      data.active = true;
      break;
    case "deactivate":
      data.active = false;
      break;
    case "feature":
      data.featured = true;
      break;
    case "unfeature":
      data.featured = false;
      break;
  }
  const updated = await prisma.product.updateMany({
    where: { id: { in: productIds } },
    data,
  });
  await logAdminAction({
    admin: { id: admin.id, email: admin.email },
    request: req,
    action: "PRODUCT_BULK",
    resource: "product",
    detail: { action, count: updated.count },
  });
  return NextResponse.json({ ok: true, updated: updated.count });
}
