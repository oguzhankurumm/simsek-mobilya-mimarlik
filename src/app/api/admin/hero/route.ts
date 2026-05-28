import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-user";
import { logAdminAction } from "@/lib/audit-log";

export const runtime = "nodejs";

const heroSchema = z.object({
  imageUrl: z.string().url(),
  title: z.string().min(1).max(200),
  highlightText: z.string().max(200).default(""),
  subtitle: z.string().max(500).default(""),
  badgeText: z.string().max(80).default(""),
  ctaText: z.string().max(80).default(""),
  ctaUrl: z.string().max(500).default(""),
  active: z.boolean().default(true),
  displayOrder: z.number().int().default(0),
});

export async function POST(req: Request) {
  const admin = await getCurrentUser({ admin: true });
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const json = await req.json().catch(() => null);
  const parsed = heroSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
  }
  const slide = await prisma.heroSlide.create({ data: parsed.data });
  await logAdminAction({
    admin: { id: admin.id, email: admin.email },
    request: req,
    action: "HERO_CREATE",
    resource: "heroSlide",
    resourceId: slide.id,
    detail: { title: parsed.data.title },
  });
  return NextResponse.json({ id: slide.id });
}
