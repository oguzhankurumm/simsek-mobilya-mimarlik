import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateResetCode, sha256 } from "@/lib/auth";

export const runtime = "nodejs";

const bodySchema = z.object({ email: z.string().email() });

// 15-minute TTL on reset codes. Never reveal whether the email exists.
// Rate-limit recommended at the edge (Vercel Firewall) — Phase G T19 covers
// in-app rate limiting per-IP/email.

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: true });
  }
  const { email } = parsed.data;

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

    // TODO Phase 2: send email via Resend. For now log to server console so
    // dev can copy the code from the terminal.
    if (process.env.NODE_ENV !== "production") {
      console.log(`[forgot] ${email} → reset code: ${rawCode}`);
    }
    // Production hook lives here: Resend send templated email.
  }

  return NextResponse.json({ ok: true });
}
