import "server-only";
import { CONTACT, SITE } from "@/config/site";

// Thin Resend wrapper — same opt-in pattern as src/server/contact-action.ts.
// If RESEND_API_KEY is unset (dev / pre-launch), the email is logged to the
// server console and the call resolves OK. Production must set the key.

interface SendEmailInput {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}

export async function sendEmail(input: SendEmailInput): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const sender =
    process.env.CONTACT_EMAIL_FROM ??
    process.env.RESEND_FROM ??
    `noreply@${SITE.domain}`;

  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[email:dev]", {
        from: sender,
        to: input.to,
        subject: input.subject,
        text: input.text,
      });
      return true;
    }
    console.warn(
      "[email] RESEND_API_KEY not set in production — email skipped",
    );
    return false;
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: sender,
      to: [input.to],
      replyTo: input.replyTo ?? CONTACT.email,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });
    return true;
  } catch (err) {
    console.error("[email] send failed", err);
    return false;
  }
}

export function buildPasswordResetEmail(opts: {
  recipientName: string;
  code: string;
}) {
  const subject = `${SITE.shortName} — Şifre Sıfırlama Kodu`;
  const text = [
    `Merhaba ${opts.recipientName},`,
    ``,
    `${SITE.shortName} hesabınız için şifre sıfırlama kodu:`,
    ``,
    `   ${opts.code}`,
    ``,
    `Bu kod 15 dakika içinde geçerlidir. Talebi siz yapmadıysanız bu`,
    `e-postayı yok sayabilirsiniz; hesabınız güvende.`,
    ``,
    `— ${SITE.name}`,
  ].join("\n");

  const html = `
    <div style="font-family: ui-sans-serif, system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <p style="font-size: 14px; color: #444;">Merhaba ${escapeHtml(opts.recipientName)},</p>
      <p style="font-size: 14px; color: #444;">${escapeHtml(SITE.shortName)} hesabınız için şifre sıfırlama kodu:</p>
      <p style="font-size: 28px; font-weight: 700; letter-spacing: 8px; text-align: center; margin: 24px 0; color: #111; font-variant-numeric: tabular-nums;">
        ${escapeHtml(opts.code)}
      </p>
      <p style="font-size: 12px; color: #777;">Bu kod 15 dakika içinde geçerlidir. Talebi siz yapmadıysanız bu e-postayı yok sayabilirsiniz.</p>
      <p style="font-size: 12px; color: #999; margin-top: 32px;">— ${escapeHtml(SITE.name)}</p>
    </div>
  `;

  return { subject, text, html };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
