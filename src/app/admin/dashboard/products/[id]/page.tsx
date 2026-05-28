import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product
      .findUnique({
        where: { id },
        include: { images: { orderBy: { displayOrder: "asc" } } },
      })
      .catch(() => null),
    prisma.category
      .findMany({ orderBy: { displayOrder: "asc" } })
      .catch(() => []),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
          Ürün Düzenle
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          {product.name}
        </h1>
      </header>
      <ProductForm
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          categoryId: product.categoryId,
          description: product.description,
          originalPrice: product.originalPrice.toString(),
          salePrice: product.salePrice.toString(),
          stock: product.stock,
          featured: product.featured,
          active: product.active,
          imageUrl: product.images[0]?.url ?? "",
          widthCm: product.widthCm,
          depthCm: product.depthCm,
          heightCm: product.heightCm,
          material: product.material,
          color: product.color,
          room: product.room,
        }}
      />
    </div>
  );
}
