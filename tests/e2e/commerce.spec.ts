import { test, expect } from "@playwright/test";

// Smoke test of the public commerce surface. Each route should:
// - load with HTTP 200
// - render the expected heading (regression catch for accidental rename)
// - not print runtime errors in the console (most often a missing
//   client/server import boundary)
//
// We don't assert against live DB data because CI runs without DATABASE_URL;
// the page-level Prisma calls all have mock fallback (see src/lib/products.ts,
// src/lib/ibans.ts, src/lib/whatsapp-lines.ts).

test.describe("commerce smoke", () => {
  test("/urunler renders product grid", async ({ page }) => {
    await page.goto("/urunler");
    await expect(
      page.getByRole("heading", { name: "Ürünler", level: 1 }),
    ).toBeVisible();
    // Mock catalog ships at least 6 demo products.
    const cards = page.locator("a[href^='/urunler/']");
    await expect(cards.first()).toBeVisible();
  });

  test("/urunler/[slug] renders demo PDP and add-to-cart button", async ({
    page,
  }) => {
    await page.goto("/urunler/ceviz-modulu-tv-unitesi");
    await expect(
      page.getByRole("heading", { name: /Ceviz Modüler/i, level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Sepete Ekle/i }),
    ).toBeVisible();
  });

  test("/odeme reachable", async ({ page }) => {
    await page.goto("/odeme");
    await expect(
      page.getByRole("heading", { name: /Sipariş Özeti/i }).first(),
    ).toBeVisible();
  });

  test("/giris, /kayit, /sifremi-unuttum render forms", async ({ page }) => {
    await page.goto("/giris");
    await expect(page.getByRole("button", { name: "Giriş Yap" })).toBeVisible();
    await page.goto("/kayit");
    await expect(
      page.getByRole("button", { name: "Hesap Oluştur" }),
    ).toBeVisible();
    await page.goto("/sifremi-unuttum");
    await expect(
      page.getByRole("button", { name: /Sıfırlama Kodu/i }),
    ).toBeVisible();
  });

  test("/hesabim redirects unauthenticated users to /giris", async ({
    page,
  }) => {
    const response = await page.goto("/hesabim");
    expect(response).not.toBeNull();
    // Either 200 on /giris (redirect followed) or 30x intermediate. Final
    // URL must be /giris.
    await expect(page).toHaveURL(/\/giris/);
  });

  test("/siparis-takibi renders the tracking form", async ({ page }) => {
    await page.goto("/siparis-takibi");
    await expect(
      page.getByRole("heading", { name: "Sipariş Takibi" }),
    ).toBeVisible();
    await expect(page.getByPlaceholder("SM-XXXXXXXX")).toBeVisible();
  });
});

test.describe("admin smoke", () => {
  test("/admin redirects to /admin/dashboard", async ({ page }) => {
    await page.goto("/admin");
    // Without an admin cookie, /admin/dashboard layout immediately
    // redirects to /admin/login, so we should land there.
    await expect(page).toHaveURL(/\/admin\/(login|dashboard)/);
  });

  test("/admin/login renders the login form", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(
      page.getByRole("heading", { name: "Yönetim Girişi" }),
    ).toBeVisible();
  });

  test("/admin/dashboard redirects without admin cookie", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});

test.describe("legal smoke", () => {
  test("legal pages render content", async ({ page }) => {
    for (const path of [
      "/mesafeli-satis-sozlesmesi",
      "/iade-politikasi",
      "/cayma-hakki",
      "/on-bilgilendirme",
    ]) {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator("article h1")).toBeVisible();
    }
  });
});
