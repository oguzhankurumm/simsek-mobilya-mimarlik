import { prisma } from "@/lib/prisma";
import { SimpleCrudTable } from "@/components/admin/simple-crud-table";

export const dynamic = "force-dynamic";

export default async function CategoriesAdminPage() {
  const categories = await prisma.category
    .findMany({ orderBy: { displayOrder: "asc" } })
    .catch(() => []);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
          Ürün Kategorileri
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Kategoriler
        </h1>
      </header>
      <SimpleCrudTable
        entityKey="category"
        reorderable
        rows={categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          imageUrl: c.imageUrl,
          displayOrder: c.displayOrder,
          active: c.active,
        }))}
        columns={[
          { key: "name", label: "İsim" },
          { key: "slug", label: "Slug" },
          { key: "imageUrl", label: "Görsel URL", width: "30%" },
          { key: "displayOrder", label: "Sıra", type: "number", width: "8%" },
          { key: "active", label: "Aktif", type: "checkbox", width: "8%" },
        ]}
        apiPath="/api/admin/categories"
        emptyRow={{
          name: "",
          slug: "",
          imageUrl: "",
          displayOrder: 0,
          active: true,
        }}
      />
    </div>
  );
}
