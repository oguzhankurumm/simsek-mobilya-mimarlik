import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateResetCode, sha256 } from "@/lib/auth";
import { buildPasswordResetEmail, sendEmail } from "@/lib/send-email";
import { rateLimit, clientIpFromRequest } from "@/lib/rate-limit";

export const runtime = "nodejs";

const bodySchema = z.object({ email: z.string().email() });
const HOUR_MS = 60 * 60 * 1000;

// 15-minute TTL on reset codes. Never reveal whether the email exists.
// In-process rate limit (per-instance) — 3/hour/email + 10/hour/IP. For
// cross-instance limits on Vercel fluid compute, swap rate-limit.ts for
// an Upstash/KV-backed implementation.

export async function POST(req: Request) {
  // 10/hour/IP limit defeats wholesale enumeration; 3/hour/email limit
  // defeats targeted spam.
  const ip = clientIpFromRequest(req);
  const ipLimit = await rateLimit(`forgot:ip:${ip}`, 10, HOUR_MS);
  if (!ipLimit.allowed) {
    return NextResponse.json(
      { error: "Çok fazla istek. Lütfen biraz bekleyin." },
      { status: 429 },
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: true });
  }
  const { email } = parsed.data;

  const emailLimit = await rateLimit(`forgot:email:${email.toLowerCase()}`, 3, HOUR_MS);
  if (!emailLimit.allowed) {
    // Same response shape as success — don't leak that this email exists.
    return NextResponse.json({ ok: true });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const rawCode = generateResetCode();
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        codeHash: sha256(rawCode),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    const { subject, text, html } = buildPasswordResetEmail({
      recipientName: user.name,
      code: rawCode,
    });
    await sendEmail({ to: user.email, subject, text, html });
  }

  return NextResponse.json({ ok: true });
}
