import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-user";
import { logAdminAction } from "@/lib/audit-log";

export const runtime = "nodejs";

const productSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(200),
  categoryId: z.string().min(1),
  description: z.string().max(5000).optional().default(""),
  originalPrice: z.number().nonnegative(),
  salePrice: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
  featured: z.boolean().optional().default(false),
  active: z.boolean().optional().default(true),
  imageUrl: z.string().url().optional().or(z.literal("")),
  widthCm: z.number().int().nonnegative().nullable().optional(),
  depthCm: z.number().int().nonnegative().nullable().optional(),
  heightCm: z.number().int().nonnegative().nullable().optional(),
  material: z.array(z.string()).optional().default([]),
  color: z.array(z.string()).optional().default([]),
  room: z.string().nullable().optional(),
});

export async function POST(req: Request) {
  const admin = await getCurrentUser({ admin: true });
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = productSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Geçersiz veri", issues: parsed.error.issues },
      { status: 400 },
    );
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

  const product = await prisma.product.create({
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
      images: data.imageUrl
        ? {
            create: {
              url: data.imageUrl,
              isMain: true,
              displayOrder: 0,
            },
          }
        : undefined,
    },
  });

  await logAdminAction({
    admin: { id: admin.id, email: admin.email },
    request: req,
    action: "PRODUCT_CREATE",
    resource: "product",
    resourceId: product.id,
    detail: { name: data.name, slug: data.slug },
  });

  return NextResponse.json({ id: product.id });
}
