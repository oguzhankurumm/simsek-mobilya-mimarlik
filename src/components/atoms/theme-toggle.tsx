"use client";

import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { Moon, Sun, Monitor } from "lucide-react";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const t = useTranslations("nav");
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  function applyTheme(next: "light" | "dark" | "system") {
    if (!mounted) {
      setTheme(next);
      return;
    }
    const supportsViewTransition =
      typeof document !== "undefined" &&
      "startViewTransition" in document &&
      typeof (document as Document & {
        startViewTransition?: (cb: () => void) => void;
      }).startViewTransition === "function";

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (supportsViewTransition && !reducedMotion) {
      (document as Document & {
        startViewTransition?: (cb: () => void) => void;
      }).startViewTransition!(() => setTheme(next));
    } else {
      setTheme(next);
    }
  }

  const isDark = mounted && (resolvedTheme === "dark" || theme === "dark");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("themeLight")}
          className="h-9 w-9"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={() => applyTheme("light")} className="gap-2">
          <Sun className="h-4 w-4" /> {t("themeLight")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => applyTheme("dark")} className="gap-2">
          <Moon className="h-4 w-4" /> {t("themeDark")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => applyTheme("system")} className="gap-2">
          <Monitor className="h-4 w-4" /> {t("themeSystem")}
        </DropdownMenuItem>
        <span className="sr-only">{isDark ? "dark" : "light"}</span>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
