import { NextResponse } from "next/server";
import { z } from "zod";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-user";
import { logAdminAction } from "@/lib/audit-log";

export const runtime = "nodejs";

// CRUD for the gallery on a specific product. The product's "isMain" image
// is the one that shows on cards / PDP hero / OG share image.

const addSchema = z.object({
  url: z.string().url(),
  altText: z.string().max(200).optional().default(""),
  isMain: z.boolean().optional().default(false),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getCurrentUser({ admin: true });
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { id } = await params;
  const images = await prisma.productImage.findMany({
    where: { productId: id },
    orderBy: { displayOrder: "asc" },
  });
  return NextResponse.json({ images });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getCurrentUser({ admin: true });
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  const json = await req.json().catch(() => null);
  const parsed = addSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
  }

  const last = await prisma.productImage.findFirst({
    where: { productId: id },
    orderBy: { displayOrder: "desc" },
    select: { displayOrder: true },
  });
  const nextOrder = (last?.displayOrder ?? -1) + 1;

  // Maintain the single-isMain invariant.
  if (parsed.data.isMain) {
    await prisma.productImage.updateMany({
      where: { productId: id, isMain: true },
      data: { isMain: false },
    });
  } else {
    // If this is the first image, make it main automatically.
    const count = await prisma.productImage.count({ where: { productId: id } });
    if (count === 0) parsed.data.isMain = true;
  }

  const image = await prisma.productImage.create({
    data: {
      productId: id,
      url: parsed.data.url,
      altText: parsed.data.altText,
      isMain: parsed.data.isMain,
      displayOrder: nextOrder,
    },
  });

  await logAdminAction({
    admin: { id: admin.id, email: admin.email },
    request: req,
    action: "PRODUCT_IMAGE_ADD",
    resource: "productImage",
    resourceId: image.id,
    detail: { productId: id, isMain: parsed.data.isMain },
  });

  return NextResponse.json({ id: image.id });
}
