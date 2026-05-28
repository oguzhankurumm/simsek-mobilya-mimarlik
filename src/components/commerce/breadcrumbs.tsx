import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SITE } from "@/config/site";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

// Visual breadcrumb trail + schema.org BreadcrumbList JSON-LD. Renders the
// items as a horizontal scroll on mobile so long category names don't
// overflow. The last item is the current page and is not a link.

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const ld = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `${SITE.url}${item.href}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(ld) }}
      />
      <nav
        aria-label="Sayfa konumu"
        className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0"
      >
        <ol className="flex w-max items-center gap-1.5 text-xs text-ink-muted md:w-auto">
          {items.map((item, i) => {
            const isLast = i === items.length - 1;
            return (
              <li
                key={`${item.label}-${i}`}
                className="flex shrink-0 items-center gap-1.5"
              >
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="hover:text-brand"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={isLast ? "font-medium text-ink" : ""}
                    aria-current={isLast ? "page" : undefined}
                  >
                    {item.label}
                  </span>
                )}
                {!isLast ? (
                  <ChevronRight
                    className="h-3 w-3 text-ink-faint"
                    aria-hidden
                  />
                ) : null}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

// Identical escaping policy as the product JSON-LD — keeps the inline
// script safe from breakout via untrusted category names.
const LINE_SEP_RE = new RegExp("\\u2028", "g");
const PARA_SEP_RE = new RegExp("\\u2029", "g");

function safeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(LINE_SEP_RE, "\\u2028")
    .replace(PARA_SEP_RE, "\\u2029");
}
