import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsAdminPage() {
  const settings = await prisma.siteSettings
    .findUnique({ where: { id: "singleton" } })
    .catch(() => null);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
          Site Yapılandırması
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Ayarlar</h1>
        <p className="mt-2 text-sm text-zinc-500">
          ETBİS, MERSIS, VKN bilgileri footer ve checkout&apos;ta gösterilir.
        </p>
      </header>

      <SettingsForm
        initialValues={{
          siteName: settings?.siteName ?? "Şimşek Mobilya & Mimarlık",
          metaDescription: settings?.metaDescription ?? "",
          whatsappFloatNumber: settings?.whatsappFloatNumber ?? "",
          freeShippingThreshold:
            settings?.freeShippingThreshold
              ? Number(settings.freeShippingThreshold.toString())
              : 5000,
          maintenanceMode: settings?.maintenanceMode ?? false,
          vkn: settings?.vkn ?? "",
          mersisNo: settings?.mersisNo ?? "",
          etbisNo: settings?.etbisNo ?? "",
          legalAddress: settings?.legalAddress ?? "",
        }}
      />
    </div>
  );
}
