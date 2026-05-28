import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-user";

export const runtime = "nodejs";

const addressSchema = z.object({
  title: z.string().min(1).max(80),
  fullName: z.string().min(2).max(120),
  phone: z.string().min(6).max(30),
  city: z.string().min(1).max(80),
  district: z.string().min(1).max(80),
  addressLine: z.string().min(4).max(500),
  isDefault: z.boolean().optional().default(false),
});

export async function POST(req: Request) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = addressSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
  }

  if (parsed.data.isDefault) {
    await prisma.address.updateMany({
      where: { userId: me.id, isDefault: true },
      data: { isDefault: false },
    });
  }

  const created = await prisma.address.create({
    data: { ...parsed.data, userId: me.id },
  });
  return NextResponse.json({ id: created.id });
}
