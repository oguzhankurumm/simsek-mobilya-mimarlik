import { prisma } from "@/lib/prisma";
import { SimpleCrudTable } from "@/components/admin/simple-crud-table";

export const dynamic = "force-dynamic";

export default async function WhatsappAdminPage() {
  const lines = await prisma.whatsappLine
    .findMany({ orderBy: { displayOrder: "asc" } })
    .catch(() => []);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
          Sipariş İletişim Hatları
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">WhatsApp</h1>
      </header>
      <SimpleCrudTable
        entityKey="whatsapp"
        rows={lines.map((l) => ({
          id: l.id,
          label: l.label,
          number: l.number,
          displayOrder: l.displayOrder,
          active: l.active,
        }))}
        columns={[
          { key: "label", label: "Etiket" },
          { key: "number", label: "Numara" },
          { key: "displayOrder", label: "Sıra", type: "number", width: "10%" },
          { key: "active", label: "Aktif", type: "checkbox", width: "10%" },
        ]}
        apiPath="/api/admin/whatsapp"
        emptyRow={{
          label: "",
          number: "",
          displayOrder: 0,
          active: true,
        }}
      />
    </div>
  );
}
