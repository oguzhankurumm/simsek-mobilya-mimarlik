import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-user";
import {
  AUTH_COOKIE_NAME,
  hashPassword,
  verifyPassword,
  verifyToken,
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

  const passwordHash = await hashPassword(parsed.data.newPassword);

  // Identify the current session so we keep the user logged in on THIS device
  // while revoking every other session (now actually enforced — see
  // verifySession). One transaction so a failed purge can't leave the password
  // changed but other sessions alive, or vice-versa.
  const currentToken = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  const currentSid = currentToken
    ? (await verifyToken(currentToken))?.sid
    : undefined;

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: me.id }, data: { passwordHash } });
    await tx.session.deleteMany({
      where: {
        userId: me.id,
        ...(currentSid ? { id: { not: currentSid } } : {}),
      },
    });
  });

  return NextResponse.json({ ok: true });
}
