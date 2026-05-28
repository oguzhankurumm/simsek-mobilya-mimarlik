import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag,
  Heart,
  MapPin,
  User as UserIcon,
  LogOut,
} from "lucide-react";
import { getCurrentUser } from "@/lib/get-user";
import { LogoutButton } from "@/components/commerce/logout-button";

const ACCOUNT_LINKS = [
  { href: "/hesabim", label: "Genel", icon: UserIcon },
  { href: "/hesabim/siparislerim", label: "Siparişlerim", icon: ShoppingBag },
  { href: "/hesabim/favorilerim", label: "Favorilerim", icon: Heart },
  { href: "/hesabim/adreslerim", label: "Adreslerim", icon: MapPin },
];

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");

  return (
    <section className="container mx-auto max-w-5xl px-4 py-8 md:py-12">
      <header className="mb-8 flex flex-col items-start justify-between gap-2 md:flex-row md:items-end">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-ink-faint">
            Hesabım
          </p>
          <h1 className="mt-1 text-display text-3xl tracking-tight">
            Merhaba {user.name?.split(" ")[0] ?? "müşterimiz"}
          </h1>
        </div>
        <LogoutButton />
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[220px_1fr]">
        <nav className="rounded-2xl border border-border bg-background p-2">
          <ul className="flex md:flex-col">
            {ACCOUNT_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <li key={link.href} className="flex-1">
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm hover:bg-surface-2"
                  >
                    <Icon className="h-4 w-4 text-ink-muted" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              );
            })}
            <li className="md:hidden">
              <Link
                href="/api/auth/logout"
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-red-600"
              >
                <LogOut className="h-4 w-4" />
                <span>Çıkış</span>
              </Link>
            </li>
          </ul>
        </nav>

        <div className="rounded-2xl border border-border bg-background p-5 md:p-7">
          {children}
        </div>
      </div>
    </section>
  );
}
