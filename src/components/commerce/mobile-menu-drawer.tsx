"use client";

import Link from "next/link";
import { Drawer } from "vaul";
import { X } from "lucide-react";
import { MOBILE_DRAWER_LINKS } from "@/config/commerce-nav";
import { useUIStore } from "@/lib/store/ui";
import { SOCIAL } from "@/config/site";

// "Menü" bottom-tab opens this drawer. Contains atelier links + account
// shortcuts + legal docs — everything that doesn't fit in 5 bottom tabs.

export function MobileMenuDrawer() {
  const { isMobileMenuOpen, closeMobileMenu } = useUIStore();

  return (
    <Drawer.Root
      open={isMobileMenuOpen}
      onOpenChange={(open) => !open && closeMobileMenu()}
      direction="right"
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/50 md:hidden" />
        <Drawer.Content className="fixed right-0 top-0 z-50 flex h-full w-full max-w-xs flex-col bg-background outline-none shadow-2xl md:hidden">
          <Drawer.Title className="sr-only">Menü</Drawer.Title>

          <header className="flex items-center justify-between border-b border-border px-4 py-4">
            <h2 className="text-sm font-semibold tracking-wide uppercase">
              Menü
            </h2>
            <button
              onClick={closeMobileMenu}
              className="rounded-md p-2 text-ink-muted hover:bg-surface-2"
              aria-label="Menüyü kapat"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <nav className="flex-1 overflow-y-auto py-2">
            <ul>
              {MOBILE_DRAWER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={closeMobileMenu}
                    className="block border-b border-border/50 px-4 py-3.5 text-sm font-medium hover:bg-surface-2"
                  >
                    {link.labelTr}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <footer className="border-t border-border px-4 py-4 text-xs text-ink-muted">
            <div className="flex items-center justify-between">
              <span>© Şimşek Mobilya & Mimarlık</span>
              <a
                href={SOCIAL.whatsapp.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-brand"
              >
                WhatsApp
              </a>
            </div>
          </footer>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
