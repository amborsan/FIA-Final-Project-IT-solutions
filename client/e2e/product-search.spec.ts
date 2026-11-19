import { expect, test } from "@playwright/test";
import { translations } from "../src/i18n/translations";
import type { Product } from "../src/lib/types";

test.use({ reducedMotion: "reduce", hasTouch: true });
for (const language of ["en", "de"] as const) {
  test(`${language}: product search keeps a visible label and fits narrow screens`, async ({ page }) => {
    const t = translations[language];
    await page.addInitScript(language => {
      localStorage.setItem("orbit_language", language);
      localStorage.setItem("orbit_cookie_consent", "true");
      localStorage.setItem("orbit_theme", "light");
    }, language);
    const catalog = page.waitForResponse(response => new URL(response.url()).pathname === "/api/products" && response.request().method() === "GET");
    await page.goto("/products");
    const response = await catalog;
    expect(response.ok()).toBe(true);
    const { products } = await response.json() as { products: Product[] };
    expect(products.length).toBeGreaterThan(1);
    const main = page.locator("main");
    const search = main.getByRole("textbox", { name: t["products.searchLabel"], exact: true });
    const label = main.getByText(t["products.searchLabel"], { exact: true });
    const cards = main.locator("article");
    await expect(cards).toHaveCount(products.length);
    await expect(search).toHaveAttribute("placeholder", t["products.searchPlaceholder"]);
    for (const width of [320, 360, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 931 });
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      await expect(label).toBeVisible();
      await expect(search).toHaveCSS("font-size", "16px");
      const inputBox = await search.boundingBox();
      const labelBox = await label.boundingBox();
      expect(inputBox!.x).toBeGreaterThanOrEqual(0);
      expect(inputBox!.x + inputBox!.width).toBeLessThanOrEqual(width);
      expect(labelBox!.y + labelBox!.height).toBeLessThan(inputBox!.y);
      if (width === 320) {
        await search.scrollIntoViewIfNeeded();
        await page.screenshot({ path: `test-results/product-search-${language}-320.png` });
      }
    }
    const product = products[0];
    await search.fill(product.sku.toLowerCase());
    await expect(cards).toHaveCount(1);
    await expect(main.locator(`a[href="/products/${product.slug}"]`).first()).toBeVisible();
    await expect(label).toBeVisible();
    await search.fill("no-matching-product-795201");
    await expect(cards).toHaveCount(0);
    await expect(main.getByText(t["products.noProducts"], { exact: true })).toBeVisible();
    await expect(label).toBeVisible();
    await search.clear();
    await expect(cards).toHaveCount(products.length);
    if (product.category) {
      const categoryName = language === "en" ? product.category.nameEn : product.category.nameDe;
      await main.getByRole("button", { name: categoryName, exact: true }).click();
      await expect.poll(() => new URL(page.url()).searchParams.get("category")).toBe(product.category.slug);
      await search.fill(product.sku);
      await expect(cards).toHaveCount(1);
      await search.clear();
      await expect(cards).toHaveCount(products.filter(entry => entry.categoryId === product.categoryId).length);
    }
    await page.getByRole("button", { name: t["theme.switchToDark"], exact: true }).click();
    await expect(label).toBeVisible();
    await expect(search).toHaveCSS("font-size", "16px");
  });
}
