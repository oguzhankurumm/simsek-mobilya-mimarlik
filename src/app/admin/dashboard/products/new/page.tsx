import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await prisma.category
    .findMany({ orderBy: { displayOrder: "asc" } })
    .catch(() => []);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
          Yeni Ürün
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Ekle</h1>
      </header>
      <ProductForm categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
    </div>
  );
}
