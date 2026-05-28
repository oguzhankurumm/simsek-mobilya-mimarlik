"use client";

import { useState, useEffect } from "react";
import { Phone, Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/atoms/logo";
import { ThemeToggle } from "@/components/atoms/theme-toggle";
import { LocaleSwitcher } from "@/components/atoms/locale-switcher";
import { CartIconButton } from "@/components/commerce/cart-icon-button";
import { Link, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { CONTACT, NAV_ITEMS } from "@/config/site";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/routing";
import type { ComponentProps } from "react";

interface SiteHeaderProps {
  locale: Locale;
}

type AppHref = ComponentProps<typeof Link>["href"];

export function SiteHeader({ locale }: SiteHeaderProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = open ? "hidden" : original;
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  // Close mobile menu when the route changes. Effect → setState is the
  // canonical pattern for "react to external (router) state".
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-[backdrop-filter,background-color,border-color,padding] duration-300",
        "border-b border-transparent",
        scrolled || open
          ? "bg-background/80 backdrop-blur-xl backdrop-saturate-150 border-border"
          : "bg-transparent"
      )}
    >
      <div className="container-editorial flex items-center gap-4 py-3 md:py-4">
        <Logo size="md" withText className="shrink-0" />

        <nav className="hidden lg:flex items-center gap-1 mx-auto" aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const label = locale === "tr" ? item.labelTr : item.labelEn;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href as AppHref}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium tracking-wide transition-colors",
                  "hover:text-brand",
                  isActive ? "text-ink" : "text-ink-muted"
                )}
              >
                {label}
                {isActive ? (
                  <span className="absolute left-3 right-3 -bottom-px h-px bg-brand" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <a
            href={`tel:${CONTACT.phoneE164}`}
            className="hidden md:inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-ink hover:text-brand transition-colors"
            aria-label={t("callForAppointment")}
          >
            <Phone className="h-3.5 w-3.5" />
            <span className="tabular-nums">{CONTACT.phoneDisplay}</span>
          </a>
          <LocaleSwitcher />
          <ThemeToggle />
          <CartIconButton />
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-9 w-9"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? t("close") : t("menu")}
            aria-expanded={open}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "lg:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-out",
          open ? "max-h-screen opacity-100 border-t border-border" : "max-h-0 opacity-0"
        )}
        aria-hidden={!open}
      >
        <nav className="container-editorial flex flex-col py-4 gap-1" aria-label="Mobile">
          {NAV_ITEMS.map((item) => {
            const label = locale === "tr" ? item.labelTr : item.labelEn;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href as AppHref}
                className={cn(
                  "flex items-baseline justify-between rounded-md px-2 py-3 transition-colors",
                  "hover:bg-surface-2",
                  isActive ? "text-brand" : "text-ink"
                )}
              >
                <span className="text-display text-2xl tracking-tight">{label}</span>
                <span className="text-xs font-mono text-ink-faint">
                  0{NAV_ITEMS.indexOf(item) + 1}
                </span>
              </Link>
            );
          })}
          <a
            href={`tel:${CONTACT.phoneE164}`}
            className="mt-3 flex items-center gap-2 rounded-md bg-ink text-background px-4 py-3 text-sm font-medium"
          >
            <Phone className="h-4 w-4" />
            <span>{t("callUs")}</span>
            <span className="tabular-nums ml-auto">{CONTACT.phoneDisplay}</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
