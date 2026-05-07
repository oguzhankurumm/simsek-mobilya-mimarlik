import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { SITE } from "@/config/site";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  withText?: boolean;
  className?: string;
}

const SIZE_PX = { sm: 32, md: 40, lg: 56 } as const;

export function Logo({ size = "md", withText = true, className }: LogoProps) {
  const px = SIZE_PX[size];
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-3 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm",
        className
      )}
      aria-label={SITE.name}
    >
      <Image
        src="/logo.png"
        alt=""
        width={px}
        height={Math.round(px * (477 / 523))}
        className="h-auto w-auto"
        style={{ height: px, width: "auto" }}
        priority
      />
      {withText ? (
        <span className="hidden sm:flex flex-col leading-tight">
          <span
            className="text-display text-[1.05rem] font-semibold tracking-tight"
            style={{ fontVariationSettings: '"SOFT" 50, "opsz" 14' }}
          >
            Şimşek
          </span>
          <span className="text-[0.625rem] uppercase tracking-[0.22em] text-ink-faint -mt-0.5">
            Mobilya & Mimarlık
          </span>
        </span>
      ) : null}
    </Link>
  );
}
