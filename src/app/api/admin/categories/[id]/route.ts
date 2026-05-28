import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-user";
import { logAdminAction } from "@/lib/audit-log";

export const runtime = "nodejs";

const patchSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  slug: z.string().min(1).max(120).optional(),
  description: z.string().max(500).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  active: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
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
  await prisma.category.update({ where: { id }, data: parsed.data });
  await logAdminAction({
    admin: { id: admin.id, email: admin.email },
    request: req,
    action: "CATEGORY_PATCH",
    resource: "category",
    resourceId: id,
    detail: parsed.data,
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
  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    return NextResponse.json(
      { error: `Bu kategoride ${productCount} ürün var, önce taşıyın` },
      { status: 409 },
    );
  }
  await prisma.category.delete({ where: { id } });
  await logAdminAction({
    admin: { id: admin.id, email: admin.email },
    request: req,
    action: "CATEGORY_DELETE",
    resource: "category",
    resourceId: id,
  });
  return NextResponse.json({ ok: true });
}
