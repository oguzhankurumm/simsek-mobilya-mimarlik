import { test, expect } from "@playwright/test";

test.describe("İletişim sayfası", () => {
  test("doğrudan kanallar görünür", async ({ page }) => {
    await page.goto("/iletisim");
    await expect(page.getByRole("heading", { name: "İletişim", level: 1 })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /0 \(532\) 646 39 19/ }).first()
    ).toBeVisible();
  });

  test("form validation tetiklenir", async ({ page }) => {
    await page.goto("/iletisim");
    await page.getByRole("button", { name: /mesajı gönder/i }).click();
    await expect(page.getByText(/lütfen adınızı/i)).toBeVisible();
  });

  test("doğru veriyle form gönderimi başarılı", async ({ page }) => {
    await page.goto("/iletisim");
    await page.getByLabel("Adınız Soyadınız").fill("Test Kullanıcı");
    await page.getByLabel(/^E-posta$/).fill("test@example.com");
    await page.getByLabel("Telefon").fill("+905554443322");
    await page
      .getByLabel(/Projenizi anlatın/)
      .fill("Salonumuz için 28 m² özel oturma grubu düşünüyoruz. Detayları konuşalım.");
    await page.getByRole("button", { name: /^mesajı gönder$/i }).click();
    await expect(page.getByRole("heading", { name: /aldık, teşekkürler/i })).toBeVisible({
      timeout: 15_000,
    });
  });
});
