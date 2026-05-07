"use client";

import { Phone, MessageCircle } from "lucide-react";
import { CONTACT, SOCIAL } from "@/config/site";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function StickyContactBar() {
  const t = useTranslations("nav");
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "md:hidden fixed bottom-3 left-3 right-3 z-30 pb-safe",
        "transition-[transform,opacity] duration-300",
        show ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0"
      )}
      aria-hidden={!show}
    >
      <div className="grid grid-cols-2 gap-2">
        <a
          href={`tel:${CONTACT.phoneE164}`}
          className="flex items-center justify-center gap-2 rounded-full bg-ink text-background px-4 py-3 text-sm font-medium shadow-lg"
          aria-label={t("callUs")}
        >
          <Phone className="h-4 w-4" />
          <span>{t("callUs")}</span>
        </a>
        <a
          href={SOCIAL.whatsapp.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-full bg-brand text-white px-4 py-3 text-sm font-medium shadow-lg"
          aria-label="WhatsApp"
        >
          <MessageCircle className="h-4 w-4" />
          <span>WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
