import { test, expect } from "@playwright/test";

test.describe("Anasayfa", () => {
  test("hero başlığı ve CTA görünür", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/Şimşek Mobilya/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const cta = page
      .getByRole("link")
      .filter({ hasText: /Çalışmalarımızı gör/i })
      .first();
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/calismalar");
  });

  test("ana navigasyon TR linkleri çalışır", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Çalışmalarımız", exact: true }).first().click();
    await expect(page).toHaveURL(/\/calismalar$/);
    await expect(
      page.getByRole("heading", { name: "Çalışmalarımız", level: 1 })
    ).toBeVisible();
  });

  test("locale switcher TR'den EN'e geçer", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /dil|language/i }).click();
    await page.getByRole("menuitem", { name: /english/i }).click();
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/your home/i);
  });

  test("featured projects bölümü en az 3 kart gösterir", async ({ page }) => {
    await page.goto("/");
    await page.locator("text=Seçilmiş çalışmalar").scrollIntoViewIfNeeded();
    const cards = page.locator('a[href^="/calismalar/"]');
    expect(await cards.count()).toBeGreaterThanOrEqual(3);
  });
});
