import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { Prisma } from "@prisma/client";
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
import { rateLimit, clientIpFromRequest } from "@/lib/rate-limit";

export const runtime = "nodejs";

const HOUR_MS = 60 * 60 * 1000;

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(2).max(120),
  phone: z.string().min(8).max(20).optional(),
});

export async function POST(req: Request) {
  // 5 signups per hour per IP keeps abuse bots from creating throwaway
  // accounts en masse without blocking a legit family signing up from
  // the same WiFi.
  const ip = clientIpFromRequest(req);
  const ipLimit = await rateLimit(`register:ip:${ip}`, 5, HOUR_MS);
  if (!ipLimit.allowed) {
    return NextResponse.json(
      { error: "Çok fazla kayıt denemesi. Lütfen biraz bekleyin." },
      { status: 429 },
    );
  }

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

  // Registration necessarily reveals whether an email is already in use (409
  // here vs. success otherwise) — the same as most sites, since hiding it would
  // send a confusing "check your inbox" to someone who already has an account.
  // The per-IP rate limit above throttles bulk enumeration. Login and forgot DO
  // hide existence (uniform responses); registration is the deliberate exception.
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Bu e-posta ile zaten kayıt var" },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(password);
  let user;
  try {
    user = await prisma.user.create({
      data: {
        email,
        name,
        phone: phoneE164,
        passwordHash,
        role: "CUSTOMER",
      },
    });
  } catch (err) {
    // Unique violation on email or phone — including the TOCTOU race past the
    // findUnique check above, or a phone already tied to another account.
    // Friendly 409, not a raw 500.
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      const target = Array.isArray(err.meta?.target)
        ? err.meta.target.join(",")
        : String(err.meta?.target ?? "");
      return NextResponse.json(
        {
          error: target.includes("phone")
            ? "Bu telefon numarası zaten kayıtlı."
            : "Bu e-posta ile zaten kayıt var",
        },
        { status: 409 },
      );
    }
    console.error("REGISTER_ERROR", err);
    return NextResponse.json(
      { error: "Kayıt oluşturulamadı. Lütfen tekrar deneyin." },
      { status: 500 },
    );
  }

  // Issue session: random token in cookie, sha256 hash in DB.
  const rawToken = generateSessionToken();
  const tokenHash = sha256(rawToken);
  const expiresAt = new Date(
    Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
  );
  const session = await prisma.session.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  // Bind the JWT to this session row so logout / password-reset can revoke it.
  const jwt = await signToken(
    { userId: user.id, role: "CUSTOMER", sid: session.id },
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
