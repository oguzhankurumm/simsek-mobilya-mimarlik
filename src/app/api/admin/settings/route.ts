import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-user";
import { logAdminAction } from "@/lib/audit-log";

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

  // unstable_cache for PublicSiteSettings has a 5-minute revalidate window
  // (see src/lib/site-settings.ts). Footer + checkout will pick up changes
  // within that window; we deliberately don't manual-invalidate because
  // Next 16's revalidateTag signature is in flux. If admins need immediate
  // propagation they can hard-refresh.

  await logAdminAction({
    admin: { id: admin.id, email: admin.email },
    request: req,
    action: "SETTINGS_PATCH",
    resource: "siteSettings",
    detail: {
      maintenanceMode: parsed.data.maintenanceMode,
      vkn: parsed.data.vkn,
      etbisNo: parsed.data.etbisNo,
    },
  });

  return NextResponse.json({ ok: true });
}
