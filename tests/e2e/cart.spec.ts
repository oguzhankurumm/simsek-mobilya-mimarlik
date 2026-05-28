import { test, expect } from "@playwright/test";

// Verifies the cart flow end-to-end on the public surface, against the demo
// catalog (no DB needed). Cart store is persisted to localStorage; each test
// starts with an empty origin, so no isolation hand-holding is required.

test("add to cart → drawer opens → checkout link works", async ({ page }) => {
  await page.goto("/urunler/ceviz-modulu-tv-unitesi");
  await page.getByRole("button", { name: /Sepete Ekle/i }).click();

  // Sonner toast confirmation
  await expect(page.getByText("Sepete eklendi")).toBeVisible();

  // Drawer opens after ~200ms delay (intentional, see add-to-cart-button).
  await expect(page.getByText("Sepetim")).toBeVisible();

  // Total should not be 0 anymore.
  const total = page.getByText("Toplam");
  await expect(total).toBeVisible();

  // "Ödemeye Geç" CTA reaches checkout step 1.
  await page.getByRole("link", { name: /Ödemeye Geç/i }).click();
  await expect(page).toHaveURL(/\/odeme/);
  await expect(page.getByRole("heading", { name: /Sipariş Özeti/i })).toBeVisible();
});
