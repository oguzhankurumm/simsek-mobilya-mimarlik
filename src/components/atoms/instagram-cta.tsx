import { InstagramIcon } from "@/components/atoms/icons";
import { SOCIAL } from "@/config/site";
import { cn } from "@/lib/utils";

interface InstagramCtaProps {
  label?: string;
  className?: string;
}

export function InstagramCta({ label, className }: InstagramCtaProps) {
  return (
    <a
      href={SOCIAL.instagram.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-2 text-sm font-medium text-ink hover:text-brand transition-colors",
        className
      )}
      aria-label={`Instagram @${SOCIAL.instagram.handle}`}
    >
      <InstagramIcon className="h-4 w-4" />
      <span>@{SOCIAL.instagram.handle}</span>
      {label ? <span className="text-ink-faint">— {label}</span> : null}
    </a>
  );
}
