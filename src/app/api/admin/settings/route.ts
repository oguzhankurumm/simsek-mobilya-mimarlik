import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-user";

export const runtime = "nodejs";

const settingsSchema = z.object({
  siteName: z.string().min(1).max(200),
  metaDescription: z.string().max(500).default(""),
  whatsappFloatNumber: z.string().max(40).default(""),
  freeShippingThreshold: z.number().nonnegative(),
  maintenanceMode: z.boolean(),
  vkn: z.string().max(40).default(""),
  mersisNo: z.string().max(40).default(""),
  etbisNo: z.string().max(40).default(""),
  legalAddress: z.string().max(500).default(""),
});

export async function PATCH(req: Request) {
  const admin = await getCurrentUser({ admin: true });
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = settingsSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
  }
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {
      ...parsed.data,
      freeShippingThreshold: new Prisma.Decimal(parsed.data.freeShippingThreshold),
    },
    create: {
      id: "singleton",
      ...parsed.data,
      freeShippingThreshold: new Prisma.Decimal(parsed.data.freeShippingThreshold),
    },
  });
  return NextResponse.json({ ok: true });
}
