import { prisma } from "@/lib/prisma";
import { SimpleCrudTable } from "@/components/admin/simple-crud-table";

export const dynamic = "force-dynamic";

export default async function IbansAdminPage() {
  const ibans = await prisma.iban
    .findMany({ orderBy: { displayOrder: "asc" } })
    .catch(() => []);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
          Ödeme Hesapları
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          IBAN&apos;lar
        </h1>
      </header>
      <SimpleCrudTable
        entityKey="iban"
        rows={ibans.map((i) => ({
          id: i.id,
          title: i.title,
          bankName: i.bankName,
          accountHolder: i.accountHolder,
          ibanNumber: i.ibanNumber,
          displayOrder: i.displayOrder,
          active: i.active,
        }))}
        columns={[
          { key: "title", label: "Başlık" },
          { key: "bankName", label: "Banka" },
          { key: "accountHolder", label: "Hesap Sahibi" },
          { key: "ibanNumber", label: "IBAN", width: "30%" },
          { key: "displayOrder", label: "Sıra", type: "number", width: "8%" },
          { key: "active", label: "Aktif", type: "checkbox", width: "8%" },
        ]}
        apiPath="/api/admin/ibans"
        emptyRow={{
          title: "",
          bankName: "",
          accountHolder: "Şimşek Mobilya & Mimarlık",
          ibanNumber: "",
          displayOrder: 0,
          active: true,
        }}
      />
    </div>
  );
}
