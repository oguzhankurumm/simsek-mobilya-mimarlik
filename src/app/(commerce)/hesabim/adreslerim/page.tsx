import { redirect } from "next/navigation";
import { MapPin } from "lucide-react";
import { getCurrentUser } from "@/lib/get-user";
import { prisma } from "@/lib/prisma";

export default async function AddressesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");

  const addresses = await prisma.address
    .findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { id: "asc" }],
    })
    .catch(() => []);

  return (
    <div className="space-y-4 text-sm">
      <h2 className="text-base font-semibold">Adreslerim</h2>
      {addresses.length === 0 ? (
        <p className="rounded-md border border-dashed border-border px-3 py-3 text-ink-muted">
          Kayıtlı adresiniz yok. Siparişiniz sırasında WhatsApp üzerinden
          teslimat adresi paylaşılır. Adres ekleme/düzenleme arayüzü
          ileriki sürümde gelecek.
        </p>
      ) : (
        <ul className="space-y-3">
          {addresses.map((addr) => (
            <li
              key={addr.id}
              className="rounded-xl border border-border p-4"
            >
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-ink-muted" />
                <div className="flex-1 space-y-0.5">
                  <p className="font-medium">{addr.title}</p>
                  <p className="text-xs text-ink-muted">
                    {addr.fullName} · {addr.phone}
                  </p>
                  <p className="text-xs">
                    {addr.addressLine}, {addr.district}/{addr.city}
                  </p>
                </div>
                {addr.isDefault ? (
                  <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-medium text-brand">
                    Varsayılan
                  </span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
