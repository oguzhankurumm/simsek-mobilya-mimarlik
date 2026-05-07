import { cn } from "@/lib/utils";

interface EyebrowProps {
  children: React.ReactNode;
  className?: string;
  as?: "span" | "div" | "p";
}

export function Eyebrow({ children, className, as: As = "span" }: EyebrowProps) {
  return <As className={cn("eyebrow", className)}>{children}</As>;
}
