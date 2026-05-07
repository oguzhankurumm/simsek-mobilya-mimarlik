import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TURKISH_REPLACEMENTS: Record<string, string> = {
  ı: "i",
  İ: "i",
  ş: "s",
  Ş: "s",
  ğ: "g",
  Ğ: "g",
  ü: "u",
  Ü: "u",
  ö: "o",
  Ö: "o",
  ç: "c",
  Ç: "c",
};

export function slugify(value: string): string {
  return value
    .replace(/[ıİşŞğĞüÜöÖçÇ]/g, (m) => TURKISH_REPLACEMENTS[m] ?? m)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

const SHIMMER_CACHE = new Map<string, string>();

export function shimmerDataUrl(w: number, h: number): string {
  const key = `${w}x${h}`;
  const cached = SHIMMER_CACHE.get(key);
  if (cached) return cached;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><defs><linearGradient id="g"><stop stop-color="#1a1a1a" offset="20%"/><stop stop-color="#2a2a2a" offset="50%"/><stop stop-color="#1a1a1a" offset="70%"/></linearGradient></defs><rect width="${w}" height="${h}" fill="#1a1a1a"/><rect id="r" width="${w}" height="${h}" fill="url(#g)"/><animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1.4s" repeatCount="indefinite"/></svg>`;
  const buf =
    typeof window === "undefined"
      ? Buffer.from(svg).toString("base64")
      : window.btoa(svg);
  const url = `data:image/svg+xml;base64,${buf}`;
  SHIMMER_CACHE.set(key, url);
  return url;
}
