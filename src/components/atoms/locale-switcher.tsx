"use client";

import { useLocale, useTranslations } from "next-intl";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { useTransition } from "react";

const LOCALES = [
  { code: "tr", label: "Türkçe", flag: "TR" },
  { code: "en", label: "English", flag: "EN" },
] as const;

export function LocaleSwitcher() {
  const locale = useLocale();
  const t = useTranslations("nav");
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();
  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  function changeLocale(next: string) {
    startTransition(() => {
      // @ts-expect-error — params shape varies per page; next-intl routes accept any
      router.replace({ pathname, params }, { locale: next });
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={t("language")}
          className="h-9 gap-1.5 px-2.5 text-xs uppercase tracking-[0.18em]"
          disabled={isPending}
        >
          <Globe className="h-3.5 w-3.5" />
          <span aria-hidden>{current.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {LOCALES.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => changeLocale(l.code)}
            className="gap-3 text-sm"
            data-active={l.code === locale}
          >
            <span className="text-xs font-mono w-7 text-ink-faint">{l.flag}</span>
            <span>{l.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
