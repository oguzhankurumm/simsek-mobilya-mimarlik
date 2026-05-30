import { NextResponse } from "next/server";
import { z } from "zod";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-user";
import { logAdminAction } from "@/lib/audit-log";

export const runtime = "nodejs";

const patchSchema = z.object({
  altText: z.string().max(200).optional(),
  isMain: z.boolean().optional(),
  displayOrder: z.number().int().nonnegative().optional(),
});

export async function PATCH(
  req: Request,
  {
    params,
  }: { params: Promise<{ id: string; imageId: string }> },
) {
  const admin = await getCurrentUser({ admin: true });
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id, imageId } = await params;
  const json = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
  }

  // Verify the image belongs to THIS product before touching it. Without this
  // the `where: { id: imageId }` update lets an admin mutate another product's
  // image by passing a foreign imageId in the URL (cross-product IDOR).
  const owned = await prisma.productImage.findFirst({
    where: { id: imageId, productId: id },
    select: { id: true },
  });
  if (!owned) {
    return NextResponse.json({ error: "Görsel bulunamadı" }, { status: 404 });
  }

  // Clear-other-mains + this update in one transaction so we never leave a
  // product with zero (or two) main images mid-flight.
  await prisma.$transaction(async (tx) => {
    if (parsed.data.isMain === true) {
      await tx.productImage.updateMany({
        where: { productId: id, isMain: true },
        data: { isMain: false },
      });
    }
    await tx.productImage.update({
      where: { id: imageId },
      data: parsed.data,
    });
  });

  await logAdminAction({
    admin: { id: admin.id, email: admin.email },
    request: req,
    action: "PRODUCT_IMAGE_PATCH",
    resource: "productImage",
    resourceId: imageId,
    detail: parsed.data,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: Request,
  {
    params,
  }: { params: Promise<{ id: string; imageId: string }> },
) {
  const admin = await getCurrentUser({ admin: true });
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id, imageId } = await params;

  const image = await prisma.productImage.findFirst({
    where: { id: imageId, productId: id },
  });
  if (!image) {
    return NextResponse.json({ error: "Görsel bulunamadı" }, { status: 404 });
  }

  // Clean up the Vercel Blob if applicable.
  if (image.url.includes(".public.blob.vercel-storage.com")) {
    await del(image.url, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }).catch(() => undefined);
  }

  await prisma.productImage.delete({ where: { id: imageId } });

  // If we deleted the main image, promote the next one in order.
  if (image.isMain) {
    const next = await prisma.productImage.findFirst({
      where: { productId: id },
      orderBy: { displayOrder: "asc" },
    });
    if (next) {
      await prisma.productImage.update({
        where: { id: next.id },
        data: { isMain: true },
      });
    }
  }

  await logAdminAction({
    admin: { id: admin.id, email: admin.email },
    request: req,
    action: "PRODUCT_IMAGE_DELETE",
    resource: "productImage",
    resourceId: imageId,
    detail: { productId: id, wasMain: image.isMain },
  });

  return NextResponse.json({ ok: true });
}
