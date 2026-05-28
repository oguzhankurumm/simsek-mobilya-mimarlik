import { prisma } from "@/lib/prisma";
import { SimpleCrudTable } from "@/components/admin/simple-crud-table";

export const dynamic = "force-dynamic";

export default async function HeroAdminPage() {
  const slides = await prisma.heroSlide
    .findMany({ orderBy: { displayOrder: "asc" } })
    .catch(() => []);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
          Anasayfa Bannerları
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Hero Slides
        </h1>
      </header>
      <SimpleCrudTable
        entityKey="hero"
        rows={slides.map((s) => ({
          id: s.id,
          imageUrl: s.imageUrl,
          title: s.title,
          subtitle: s.subtitle,
          ctaUrl: s.ctaUrl,
          displayOrder: s.displayOrder,
          active: s.active,
        }))}
        columns={[
          { key: "imageUrl", label: "Görsel URL", width: "30%" },
          { key: "title", label: "Başlık" },
          { key: "subtitle", label: "Alt başlık" },
          { key: "ctaUrl", label: "CTA URL" },
          { key: "displayOrder", label: "Sıra", type: "number", width: "8%" },
          { key: "active", label: "Aktif", type: "checkbox", width: "8%" },
        ]}
        apiPath="/api/admin/hero"
        emptyRow={{
          imageUrl: "",
          title: "",
          subtitle: "",
          ctaUrl: "",
          displayOrder: 0,
          active: true,
        }}
      />
    </div>
  );
}
