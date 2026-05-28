"use client";

import { MessageCircle } from "lucide-react";
import { buildProductInquiryMessage, buildWhatsappUrl } from "@/lib/whatsapp";
import { CONTACT, SITE } from "@/config/site";
import { cn } from "@/lib/utils";

interface WhatsappInquiryButtonProps {
  productName: string;
  productSlug: string;
  className?: string;
  variant?: "primary" | "secondary";
  /** Override the default whatsapp number for testing. */
  numberE164?: string;
}

// Per Phase 2 review T17: OOS products keep a WhatsApp inquiry CTA so a
// high-consideration buyer doesn't bounce on "stokta yok". Also used as a
// secondary CTA on in-stock PDPs.

export function WhatsappInquiryButton({
  productName,
  productSlug,
  className,
  variant = "secondary",
  numberE164 = CONTACT.phoneE164,
}: WhatsappInquiryButtonProps) {
  const message = buildProductInquiryMessage({
    productName,
    productSlug,
    baseUrl: SITE.url,
  });
  const href = buildWhatsappUrl(numberE164, message);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition-colors",
        variant === "primary"
          ? "bg-[#25D366] text-white hover:bg-[#1ebe5d]"
          : "border border-border bg-background text-ink hover:bg-surface-2",
        className,
      )}
    >
      <MessageCircle className="h-4 w-4" />
      WhatsApp&apos;tan Sor
    </a>
  );
}
