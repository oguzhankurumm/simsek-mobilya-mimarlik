import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-user";
import { slugify } from "@/lib/utils";
import { logAdminAction } from "@/lib/audit-log";

export const runtime = "nodejs";

const categorySchema = z.object({
  name: z.string().min(1).max(120),
  slug: z.string().optional(),
  description: z.string().max(500).default(""),
  imageUrl: z.string().url().optional().or(z.literal("")),
  active: z.boolean().default(true),
  displayOrder: z.number().int().default(0),
});

export async function POST(req: Request) {
  const admin = await getCurrentUser({ admin: true });
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = categorySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
  }
  const slug = parsed.data.slug || slugify(parsed.data.name);
  const category = await prisma.category.create({
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      imageUrl: parsed.data.imageUrl ?? "",
      active: parsed.data.active,
      displayOrder: parsed.data.displayOrder,
    },
  });
  await logAdminAction({
    admin: { id: admin.id, email: admin.email },
    request: req,
    action: "CATEGORY_CREATE",
    resource: "category",
    resourceId: category.id,
    detail: { name: parsed.data.name, slug },
  });

  return NextResponse.json({ id: category.id });
}
