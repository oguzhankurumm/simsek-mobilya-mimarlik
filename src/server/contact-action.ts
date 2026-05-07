"use server";

import { headers } from "next/headers";
import { CONTACT, SITE } from "@/config/site";
import {
  contactFormSchema,
  type ContactFormInput,
  type ContactResult,
} from "@/lib/contact-schema";

export async function submitContactAction(
  raw: ContactFormInput
): Promise<ContactResult> {
  const parsed = contactFormSchema.safeParse(raw);
  if (!parsed.success) {
    const fields: Partial<Record<keyof ContactFormInput, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof ContactFormInput;
      if (key && !fields[key]) fields[key] = issue.message;
    }
    return { ok: false, issue: "validation", fields };
  }

  const data = parsed.data;
  if (data.website) {
    // Honeypot tripped — pretend success to avoid bot feedback.
    return { ok: true };
  }

  const ip =
    (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const subject = `[${SITE.shortName}] ${data.name} — ${data.service}`;
  const body = [
    `Yeni proje formu / New project form`,
    `--`,
    `Ad / Name: ${data.name}`,
    `E-posta / Email: ${data.email}`,
    `Telefon / Phone: ${data.phone}`,
    `Hizmet / Service: ${data.service}`,
    `Dil / Lang: ${data.locale}`,
    ``,
    `Mesaj / Message:`,
    data.message,
    ``,
    `--`,
    `IP: ${ip}`,
    `Submitted: ${new Date().toISOString()}`,
  ].join("\n");

  // Always log — visible in `vercel logs`. Acts as fallback when no email backend.
  console.log("[contact-form]", { subject, body });

  // Optional Resend integration. Skipped silently if RESEND_API_KEY is unset
  // — keeps the form functional out-of-the-box, upgrades later.
  const apiKey = process.env.RESEND_API_KEY;
  const recipient = process.env.CONTACT_EMAIL_TO ?? CONTACT.email;
  const sender = process.env.CONTACT_EMAIL_FROM ?? `noreply@${SITE.domain}`;

  if (apiKey) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(apiKey);
      await resend.emails.send({
        from: sender,
        to: [recipient],
        replyTo: data.email,
        subject,
        text: body,
      });
    } catch (err) {
      console.error("[contact-form] resend send failed", err);
      // Don't surface email backend errors to the user — the lead is logged.
    }
  }

  return { ok: true };
}
