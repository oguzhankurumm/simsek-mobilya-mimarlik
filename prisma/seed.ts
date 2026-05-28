/**
 * Şimşek Mobilya — örnek seed.
 * Çalıştırma: `npm run db:seed`
 *
 * PHASE A — sadece smoke test seed (admin user + 1 kategori + 1 ürün).
 * Phase B'de gerçek katalog için bu dosya güncellenecek (5-10 SKU).
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding…");

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@simsekmobilya.com";
  const adminPassword =
    process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe-Set-Strong-Password-Here-123!";

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash, role: "ADMIN" },
    create: {
      email: adminEmail,
      name: "Yönetici",
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log(`Admin user: ${admin.email}`);

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      siteName: "Şimşek Mobilya & Mimarlık",
      metaDescription:
        "28 yıllık atölye, özel tasarım mobilya ve mimari yenileme.",
      whatsappFloatNumber: "+905326463919",
    },
  });
  console.log("Site settings: ok");

  const livingRoom = await prisma.category.upsert({
    where: { slug: "salon" },
    update: {},
    create: {
      name: "Salon",
      slug: "salon",
      description: "Salon mobilyaları",
      displayOrder: 1,
      active: true,
    },
  });

  await prisma.product.upsert({
    where: { slug: "ornek-koltuk-takimi" },
    update: {},
    create: {
      name: "Örnek Koltuk Takımı",
      slug: "ornek-koltuk-takimi",
      categoryId: livingRoom.id,
      originalPrice: "32500.00",
      salePrice: "27500.00",
      discountPercent: 15,
      description:
        "Seed verisi — Phase B'de gerçek ürün katalogu ile değiştirilecek.",
      brand: "Şimşek Mobilya",
      stock: 3,
      featured: true,
      active: true,
      tags: ["seed"],
      material: ["ahşap", "kumaş"],
      color: ["bej"],
      room: "salon",
      widthCm: 240,
      depthCm: 95,
      heightCm: 88,
    },
  });
  console.log("Seed ürün: ok");

  await prisma.iban.upsert({
    where: { id: "seed-iban" },
    update: {},
    create: {
      id: "seed-iban",
      title: "Garanti Bankası",
      bankName: "Garanti BBVA",
      accountHolder: "Şimşek Mobilya & Mimarlık",
      ibanNumber: "TR00 0000 0000 0000 0000 0000 00",
      active: true,
      displayOrder: 1,
    },
  });
  console.log("IBAN: ok (placeholder — gerçek IBAN ile değiştir)");

  await prisma.whatsappLine.upsert({
    where: { id: "seed-whatsapp" },
    update: {},
    create: {
      id: "seed-whatsapp",
      label: "Sipariş Hattı",
      number: "+90 532 646 39 19",
      numberE164: "+905326463919",
      active: true,
      displayOrder: 1,
    },
  });
  console.log("WhatsApp line: ok");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
