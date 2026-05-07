"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { ProjectCard } from "./project-card";
import {
  PROJECTS,
  PROJECT_CATEGORIES,
  type ProjectCategory,
} from "@/content/projects";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/routing";

interface CategoryFilterProps {
  locale: Locale;
}

type FilterKey = "all" | ProjectCategory;

export function CategoryFilter({ locale }: CategoryFilterProps) {
  const t = useTranslations("portfolio");
  const [active, setActive] = useState<FilterKey>("all");
  const isTr = locale === "tr";

  const filtered = useMemo(
    () => (active === "all" ? PROJECTS : PROJECTS.filter((p) => p.category === active)),
    [active]
  );

  const counts = useMemo(() => {
    const map = new Map<FilterKey, number>();
    map.set("all", PROJECTS.length);
    for (const p of PROJECTS) {
      map.set(p.category, (map.get(p.category) ?? 0) + 1);
    }
    return map;
  }, []);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 mb-10 md:mb-14">
        <button
          type="button"
          onClick={() => setActive("all")}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm transition-colors",
            active === "all"
              ? "bg-ink text-background border-ink"
              : "border-border text-ink-muted hover:border-ink hover:text-ink"
          )}
        >
          {t("filterAll")}{" "}
          <span className="ml-1 tabular-nums text-[10px] opacity-60">
            ({counts.get("all")})
          </span>
        </button>
        {PROJECT_CATEGORIES.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => setActive(c.key)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm transition-colors",
              active === c.key
                ? "bg-ink text-background border-ink"
                : "border-border text-ink-muted hover:border-ink hover:text-ink"
            )}
          >
            {isTr ? c.labelTr : c.labelEn}
            <span className="ml-1 tabular-nums text-[10px] opacity-60">
              ({counts.get(c.key) ?? 0})
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.p
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-ink-muted py-20 text-center"
          >
            {t("noResults")}
          </motion.p>
        ) : (
          <motion.ul
            key={active}
            layout
            className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((p) => (
              <motion.li
                key={p.slug}
                layout
                initial={{ opacity: 0.001 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ProjectCard project={p} locale={locale} />
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </>
  );
}
