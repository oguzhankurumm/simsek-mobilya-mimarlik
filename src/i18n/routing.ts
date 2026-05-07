import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["tr", "en"],
  defaultLocale: "tr",
  localePrefix: "as-needed",
  localeDetection: false,
  pathnames: {
    "/": "/",
    "/portfolio": {
      tr: "/calismalar",
      en: "/work",
    },
    "/portfolio/[slug]": {
      tr: "/calismalar/[slug]",
      en: "/work/[slug]",
    },
    "/services": {
      tr: "/hizmetler",
      en: "/services",
    },
    "/about": {
      tr: "/hakkimizda",
      en: "/about",
    },
    "/contact": {
      tr: "/iletisim",
      en: "/contact",
    },
  },
});

export type Locale = (typeof routing.locales)[number];
export type AppPathname = keyof (typeof routing)["pathnames"];
