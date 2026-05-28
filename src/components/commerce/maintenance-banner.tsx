import { Wrench } from "lucide-react";

// Visible banner above the layout when SiteSettings.maintenanceMode is true.
// Doesn't block the site — admin can keep working, customers see "yeni
// alışveriş alımı yok" but can still browse + view their account. The
// checkout flow short-circuits via /api/orders 503 (not implemented here yet
// — for now we just warn).

export function MaintenanceBanner() {
  return (
    <div className="border-b border-amber-300 bg-amber-50 px-4 py-2 text-center text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
      <Wrench className="mr-1 inline h-3.5 w-3.5" />
      Bakım modundayız — yeni sipariş alımı geçici olarak durduruldu.
      Sorularınız için WhatsApp&apos;tan bize ulaşın.
    </div>
  );
}
