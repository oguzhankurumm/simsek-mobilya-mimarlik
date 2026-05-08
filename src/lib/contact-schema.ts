import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().min(2, "nameRequired"),
  email: z.string().email("emailInvalid"),
  phone: z.string().min(7, "phoneInvalid"),
  service: z.enum(["custom", "architectural", "renovation", "consultancy", "other"]),
  message: z.string().min(10, "messageMin").max(4000),
  // KVKK / GDPR — kişisel verilerin işlenmesine açık rıza zorunlu.
  consent: z.literal(true, { error: "consentRequired" }),
  // Honeypot — submissions with non-empty website are silently ignored.
  website: z.string().max(0),
  locale: z.enum(["tr", "en"]),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

export type ContactResult =
  | { ok: true }
  | {
      ok: false;
      issue?: string;
      fields?: Partial<Record<keyof ContactFormInput, string>>;
    };
