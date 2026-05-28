import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-user";

export const runtime = "nodejs";

const ibanSchema = z.object({
  title: z.string().min(1).max(120),
  bankName: z.string().min(1).max(120),
  accountHolder: z.string().min(1).max(120),
  ibanNumber: z.string().min(10).max(40),
  active: z.boolean().default(true),
  displayOrder: z.number().int().default(0),
});

export async function POST(req: Request) {
  const admin = await getCurrentUser({ admin: true });
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = ibanSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
  }
  const iban = await prisma.iban.create({ data: parsed.data });
  return NextResponse.json({ id: iban.id });
}
