import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-user";
import { del } from "@vercel/blob";
import { logAdminAction } from "@/lib/audit-log";

export const runtime = "nodejs";

const patchSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(200),
  categoryId: z.string().min(1),
  description: z.string().max(5000).default(""),
  originalPrice: z.number().nonnegative(),
  salePrice: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  imageUrl: z.string().url().optional().or(z.literal("")),
  widthCm: z.number().int().nonnegative().nullable().optional(),
  depthCm: z.number().int().nonnegative().nullable().optional(),
  heightCm: z.number().int().nonnegative().nullable().optional(),
  material: z.array(z.string()).default([]),
  color: z.array(z.string()).default([]),
  room: z.string().nullable().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getCurrentUser({ admin: true });
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  const json = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
  }
  const data = parsed.data;

  const discountPercent =
    data.originalPrice > 0
      ? Math.max(
          0,
          Math.round(
            ((data.originalPrice - data.salePrice) / data.originalPrice) * 100,
          ),
        )
      : 0;

  await prisma.product.update({
    where: { id },
    data: {
      name: data.name,
      slug: data.slug,
      categoryId: data.categoryId,
      description: data.description,
      originalPrice: new Prisma.Decimal(data.originalPrice),
      salePrice: new Prisma.Decimal(data.salePrice),
      discountPercent,
      stock: data.stock,
      featured: data.featured,
      active: data.active,
      widthCm: data.widthCm ?? null,
      depthCm: data.depthCm ?? null,
      heightCm: data.heightCm ?? null,
      material: data.material,
      color: data.color,
      room: data.room ?? null,
    },
  });

  if (data.imageUrl) {
    const existing = await prisma.productImage.findFirst({
      where: { productId: id, isMain: true },
    });
    if (existing) {
      await prisma.productImage.update({
        where: { id: existing.id },
        data: { url: data.imageUrl },
      });
    } else {
      await prisma.productImage.create({
        data: { productId: id, url: data.imageUrl, isMain: true },
      });
    }
  }

  await logAdminAction({
    admin: { id: admin.id, email: admin.email },
    request: req,
    action: "PRODUCT_PATCH",
    resource: "product",
    resourceId: id,
    detail: { name: data.name, slug: data.slug, stock: data.stock },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getCurrentUser({ admin: true });
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;

  // Pre-delete: clean up Vercel Blob orphans (T26). Best-effort.
  const images = await prisma.productImage.findMany({ where: { productId: id } });
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

  await prisma.product.delete({ where: { id } });

  await logAdminAction({
    admin: { id: admin.id, email: admin.email },
    request: req,
    action: "PRODUCT_DELETE",
    resource: "product",
    resourceId: id,
  });

  return NextResponse.json({ ok: true });
}
