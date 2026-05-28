import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-user";

export const runtime = "nodejs";

const patchSchema = z.object({
  imageUrl: z.string().url().optional(),
  title: z.string().min(1).max(200).optional(),
  highlightText: z.string().max(200).optional(),
  subtitle: z.string().max(500).optional(),
  badgeText: z.string().max(80).optional(),
  ctaText: z.string().max(80).optional(),
  ctaUrl: z.string().max(500).optional(),
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
  await prisma.heroSlide.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getCurrentUser({ admin: true });
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { id } = await params;
  await prisma.heroSlide.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
