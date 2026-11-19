import { expect, test } from "@playwright/test";
import { translations } from "../src/i18n/translations";

test.use({ reducedMotion: "reduce" });
for (const language of ["en", "de"] as const) {
  test(`${language}: product card cart feedback stays inside the card`, async ({ page }) => {
    test.setTimeout(60_000);
    const t = translations[language];
    await page.addInitScript(language => {
      localStorage.setItem("orbit_language", language);
      localStorage.setItem("orbit_cookie_consent", "true");
      localStorage.setItem("orbit_theme", "light");
    }, language);
    await page.goto("/products?category=network");
    await page.evaluate(() => document.fonts.ready);
    const card = page.locator("main article").filter({ has: page.getByRole("button", { name: t["products.addToCart"], exact: true, disabled: false }) }).first();
    const button = card.getByRole("button", { name: t["products.addToCart"], exact: true });
    const checkBounds = async () => {
      const outer = await card.boundingBox();
      const action = await button.boundingBox();
      expect(action!.x).toBeGreaterThanOrEqual(outer!.x + 12);
      expect(action!.x + action!.width).toBeLessThanOrEqual(outer!.x + outer!.width - 12);
      const text = button.locator("span").last();
      if (await text.isVisible()) {
        const label = await text.boundingBox();
        expect(label!.x + label!.width).toBeLessThanOrEqual(action!.x + action!.width - 8);
      }
    };
    for (const width of [1032, 1280, 640, 768, 1440, 320, 390]) {
      await page.setViewportSize({ width, height: 931 });
      await button.scrollIntoViewIfNeeded();
      await checkBounds();
      const before = await button.boundingBox();
      const cardBefore = await card.boundingBox();
      const quantity = await page.evaluate(() => (JSON.parse(localStorage.getItem("orbit_cart") || "[]") as { quantity: number }[]).reduce((sum, item) => sum + item.quantity, 0));
      await button.click();
      await expect(button.locator(".lucide-check")).toHaveCount(1);
      await checkBounds();
      expect((await button.boundingBox())!.width).toBeCloseTo(before!.width, 1);
      expect((await card.boundingBox())!.height).toBeCloseTo(cardBefore!.height, 1);
      await expect.poll(() => page.evaluate(() => (JSON.parse(localStorage.getItem("orbit_cart") || "[]") as { quantity: number }[]).reduce((sum, item) => sum + item.quantity, 0))).toBe(quantity + 1);
      if (width === 1032) await card.screenshot({ path: `test-results/product-cart-${language}-1032.png` });
      await expect(button.locator(".lucide-shopping-cart")).toHaveCount(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    }
  });
}
