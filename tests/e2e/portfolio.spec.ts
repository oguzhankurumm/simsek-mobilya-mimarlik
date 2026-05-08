import { test, expect } from "@playwright/test";

test.describe("Çalışmalarımız akışı", () => {
  test("liste yüklenir ve filtre çalışır", async ({ page }) => {
    await page.goto("/calismalar");
    await expect(
      page.getByRole("heading", { name: "Çalışmalarımız", level: 1 })
    ).toBeVisible();

    // Banyo kategorisinde Avrupa Konutları TEM projesi var
    await page.getByRole("button", { name: /^Banyo/ }).click();
    await expect(page.locator('a[href^="/calismalar/"]').first()).toBeVisible();
  });

  test("çalışma detay sayfasına navigasyon", async ({ page }) => {
    await page.goto("/calismalar");
    const firstProject = page.locator('a[href^="/calismalar/"]').first();
    const href = await firstProject.getAttribute("href");
    expect(href).toMatch(/\/calismalar\/[a-z0-9-]+/);
    await firstProject.click();
    await expect(page).toHaveURL(/\/calismalar\/[a-z0-9-]+/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("'sonraki çalışma' linki başka projeye yönlendirir", async ({ page }) => {
    await page.goto("/calismalar/kadikoy-evi");
    const next = page.locator('a[href^="/calismalar/"]').filter({ hasText: /Sonraki|Next/ });
    await expect(next).toBeVisible();
    await next.click();
    await expect(page).not.toHaveURL(/kadikoy-evi$/);
    await expect(page).toHaveURL(/\/calismalar\/[a-z0-9-]+/);
  });
});
