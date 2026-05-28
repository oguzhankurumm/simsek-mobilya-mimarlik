import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  AUTH_COOKIE_NAME,
  SESSION_TTL_DAYS,
  generateSessionToken,
  hashPassword,
  sha256,
  signToken,
} from "@/lib/auth";
import { normalizeE164 } from "@/lib/whatsapp";

export const runtime = "nodejs";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(2).max(120),
  phone: z.string().min(8).max(20).optional(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Geçersiz veri", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const { email, password, name, phone } = parsed.data;
  const phoneE164 = phone ? normalizeE164(phone) : null;

  // Hide existence — return same message whether email is taken or not.
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Bu e-posta ile zaten kayıt var" },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      name,
      phone: phoneE164,
      passwordHash,
      role: "CUSTOMER",
    },
  });

  // Issue session: random token in cookie, sha256 hash in DB.
  const rawToken = generateSessionToken();
  const tokenHash = sha256(rawToken);
  const expiresAt = new Date(
    Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
  );
  await prisma.session.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  const jwt = await signToken(
    { userId: user.id, role: "CUSTOMER" },
    SESSION_TTL_DAYS,
  );
  (await cookies()).set(AUTH_COOKIE_NAME, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
  });
}
