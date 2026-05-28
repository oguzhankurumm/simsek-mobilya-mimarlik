import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  AUTH_COOKIE_NAME,
  ADMIN_COOKIE_NAME,
  SESSION_TTL_DAYS,
  ADMIN_SESSION_TTL_DAYS,
  generateSessionToken,
  sha256,
  signToken,
  verifyPassword,
} from "@/lib/auth";
import { rateLimit, clientIpFromRequest } from "@/lib/rate-limit";

export const runtime = "nodejs";

const FIFTEEN_MIN_MS = 15 * 60 * 1000;

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(128),
  // When true, issue an admin cookie + verify role === ADMIN.
  admin: z.boolean().optional(),
});

export async function POST(req: Request) {
  // 20 attempts per 15 minutes per IP defeats credential-stuffing without
  // blocking real users on shared NATs.
  const ip = clientIpFromRequest(req);
  const ipLimit = rateLimit(`login:ip:${ip}`, 20, FIFTEEN_MIN_MS);
  if (!ipLimit.allowed) {
    return NextResponse.json(
      { error: "Çok fazla deneme. Lütfen birkaç dakika bekleyin." },
      { status: 429 },
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Geçersiz veri" },
      { status: 400 },
    );
  }
  const { email, password, admin } = parsed.data;

  // Per-email limit on top of per-IP: 5 wrong tries / 15min slows a
  // targeted attack against a known user without locking them out
  // entirely. Successful login doesn't bypass this — the bucket counts
  // every attempt, which is fine because a real user logs in once per
  // session.
  const emailLimit = rateLimit(
    `login:email:${email.toLowerCase()}`,
    10,
    FIFTEEN_MIN_MS,
  );
  if (!emailLimit.allowed) {
    return NextResponse.json(
      { error: "Çok fazla deneme. Birkaç dakika sonra tekrar deneyin." },
      { status: 429 },
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Constant-time-ish: do a dummy verify so wrong-email vs wrong-password
    // don't differ in response time meaningfully.
    await verifyPassword(password, "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalid").catch(
      () => null,
    );
    return NextResponse.json(
      { error: "E-posta veya şifre hatalı" },
      { status: 401 },
    );
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json(
      { error: "E-posta veya şifre hatalı" },
      { status: 401 },
    );
  }

  if (admin && user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Yetkisiz erişim" },
      { status: 403 },
    );
  }

  const ttlDays = admin ? ADMIN_SESSION_TTL_DAYS : SESSION_TTL_DAYS;
  const rawToken = generateSessionToken();
  const tokenHash = sha256(rawToken);
  const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  const jwt = await signToken({ userId: user.id, role: user.role }, ttlDays);

  const cookieName = admin ? ADMIN_COOKIE_NAME : AUTH_COOKIE_NAME;
  (await cookies()).set(cookieName, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: admin ? "strict" : "lax",
    path: "/",
    expires: expiresAt,
  });

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
}
