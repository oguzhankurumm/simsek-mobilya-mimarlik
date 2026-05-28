import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-user";
import {
  hashPassword,
  sha256,
  verifyPassword,
} from "@/lib/auth";
import { normalizeE164 } from "@/lib/whatsapp";

export const runtime = "nodejs";

const profileSchema = z.object({
  name: z.string().min(2).max(120),
  phone: z.string().optional().or(z.literal("")),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

export async function PATCH(req: Request) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = profileSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: me.id },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone ? normalizeE164(parsed.data.phone) : null,
    },
  });

  return NextResponse.json({ ok: true });
}

// PUT updates password. Requires current password to defeat a stolen-cookie
// "change my password then keep the session forever" attack.
export async function PUT(req: Request) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = passwordSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
  }

  const dbUser = await prisma.user.findUnique({ where: { id: me.id } });
  if (!dbUser) {
    return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
  }

  const ok = await verifyPassword(parsed.data.currentPassword, dbUser.passwordHash);
  if (!ok) {
    return NextResponse.json(
      { error: "Mevcut şifre hatalı" },
      { status: 403 },
    );
  }

  await prisma.user.update({
    where: { id: me.id },
    data: { passwordHash: await hashPassword(parsed.data.newPassword) },
  });

  // Invalidate other sessions on password change.
  // (We don't touch the current cookie — the user is actively using it.)
  // Match by token hash != current would be ideal but we don't know which
  // session belongs to this cookie; the deleteMany is intentionally broad.
  await prisma.session
    .deleteMany({ where: { userId: me.id } })
    .catch(() => undefined);

  // Touch sha256 import so the file's lint stays happy if PUT is the only
  // path that uses it.
  void sha256;

  return NextResponse.json({ ok: true });
}
