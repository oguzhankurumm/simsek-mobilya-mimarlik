"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  FolderTree,
  Users,
  Landmark,
  MessageCircle,
  Image as ImageIcon,
  Settings,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ADMIN_LINKS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/dashboard/orders", label: "Siparişler", icon: ShoppingCart },
  { href: "/admin/dashboard/products", label: "Ürünler", icon: Package },
  { href: "/admin/dashboard/categories", label: "Kategoriler", icon: FolderTree },
  { href: "/admin/dashboard/customers", label: "Müşteriler", icon: Users },
  { href: "/admin/dashboard/ibans", label: "IBAN'lar", icon: Landmark },
  { href: "/admin/dashboard/whatsapp", label: "WhatsApp", icon: MessageCircle },
  { href: "/admin/dashboard/hero", label: "Hero Slides", icon: ImageIcon },
  { href: "/admin/dashboard/settings", label: "Ayarlar", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Çıkış yapıldı");
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <aside className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 md:fixed md:inset-y-0 md:left-0 md:w-60 md:border-b-0 md:border-r">
      <div className="flex h-full flex-col">
        <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
            Yönetim
          </p>
          <p className="mt-1 text-sm font-semibold">Şimşek Mobilya</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-0.5">
            {ADMIN_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive =
                link.href === "/admin/dashboard"
                  ? pathname === link.href
                  : pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                        : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
          >
            <LogOut className="h-4 w-4" />
            Çıkış
          </button>
        </div>
      </div>
    </aside>
  );
}
