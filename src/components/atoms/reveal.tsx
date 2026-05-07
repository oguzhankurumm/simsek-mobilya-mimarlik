"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  threshold?: number;
  once?: boolean;
  as?: "div" | "section" | "article" | "li";
}

export function Reveal({
  children,
  className,
  delayMs = 0,
  threshold = 0.15,
  once = true,
  as: As = "div",
}: RevealProps) {
  // Start visible during SSR/pre-hydration. Only flip to "hidden + animate in"
  // once the client picks up. This way the page degrades gracefully when JS
  // hasn't loaded (or in fullPage screenshots / search engine indexing).
  const [hydrated, setHydrated] = useState(false);
  const { ref, inView } = useInView({ triggerOnce: once, threshold, rootMargin: "-40px 0px" });
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);

  const showReveal = hydrated;
  return (
    <As
      ref={ref}
      className={cn(showReveal && "reveal", showReveal && inView && "in-view", className)}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </As>
  );
}
