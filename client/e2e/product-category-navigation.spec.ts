import { expect, test } from "@playwright/test";
import { translations } from "../src/i18n/translations";
import type { Product, ProductCategory } from "../src/lib/types";

test.use({ hasTouch: true, reducedMotion: "reduce" });
for (const language of ["en", "de"] as const) {
  test(`${language}: category hints, scrolling and selection fit 320px`, async ({ page }) => {
    const t = translations[language];
    await page.addInitScript(language => {
      localStorage.setItem("orbit_language", language);
      localStorage.setItem("orbit_cookie_consent", "true");
      localStorage.setItem("orbit_theme", "light");
    }, language);
    await page.setViewportSize({ width: 320, height: 931 });
    const categoryResponse = page.waitForResponse(response => new URL(response.url()).pathname === "/api/categories");
    const productResponse = page.waitForResponse(response => new URL(response.url()).pathname === "/api/products");
    await page.goto("/products");
    const [categoryData, productData] = await Promise.all([categoryResponse, productResponse]);
    expect(categoryData.ok()).toBe(true);
    expect(productData.ok()).toBe(true);
    const { categories } = await categoryData.json() as { categories: ProductCategory[] };
    const { products } = await productData.json() as { products: Product[] };
    expect(categories.length).toBeGreaterThan(2);
    const main = page.locator("main");
    const viewport = main.getByRole("group", { name: t["products.categories"], exact: true });
    const previous = main.getByRole("button", { name: t["products.previousCategories"], exact: true });
    const next = main.getByRole("button", { name: t["products.nextCategories"], exact: true });
    await expect(main.getByText(t["products.categoryScrollHint"], { exact: true })).toBeVisible();
    await expect(viewport.getByRole("button", { name: t["common.all"], exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(previous).toBeDisabled();
    await expect(next).toBeEnabled();
    for (const control of [previous, next, ...await viewport.getByRole("button").all()]) {
      const box = await control.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    await page.screenshot({ path: `test-results/product-categories-${language}-320.png` });
    await next.tap();
    await expect.poll(() => viewport.evaluate(el => el.scrollLeft)).toBeGreaterThan(0);
    await expect(previous).toBeEnabled();
    for (let step = 0; step < categories.length && await next.isEnabled(); step++) {
      await next.tap();
      await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
    }
    await expect(next).toBeDisabled();
    const category = categories[categories.length - 1];
    const categoryName = language === "en" ? category.nameEn : category.nameDe;
    const selected = viewport.getByRole("button", { name: categoryName, exact: true });
    await selected.focus();
    await selected.press("Enter");
    await expect.poll(() => new URL(page.url()).searchParams.get("category")).toBe(category.slug);
    await expect(selected).toHaveAttribute("aria-pressed", "true");
    await expect(selected.locator(".lucide-check")).toHaveCount(1);
    await expect(selected).toHaveCSS("font-weight", "600");
    await expect(viewport.locator('[aria-pressed="true"]')).toHaveCount(1);
    await expect(main.locator("article")).toHaveCount(products.filter(product => product.categoryId === category.id).length);
    await page.goBack();
    await expect(viewport.getByRole("button", { name: t["common.all"], exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(previous).toBeDisabled();
    await selected.focus();
    await selected.press("Enter");
    for (const width of [390, 768, 1440, 320]) {
      await page.setViewportSize({ width, height: 931 });
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      await expect.poll(async () => {
        const item = await selected.boundingBox();
        const bounds = await viewport.boundingBox();
        return item!.x >= bounds!.x - 1 && item!.x + item!.width <= bounds!.x + bounds!.width + 1;
      }).toBe(true);
    }
    await page.reload();
    await expect(selected).toHaveAttribute("aria-pressed", "true");
    await expect.poll(async () => {
      const item = await selected.boundingBox();
      const bounds = await viewport.boundingBox();
      return item!.x >= bounds!.x && item!.x + item!.width <= bounds!.x + bounds!.width + 1;
    }).toBe(true);
    await page.getByRole("button", { name: t["theme.switchToDark"], exact: true }).tap();
    await expect(selected).toHaveCSS("background-color", "rgb(245, 245, 245)");
    await expect(selected).toHaveCSS("color", "rgb(13, 13, 13)");
    await viewport.scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/product-categories-${language}-dark-320.png` });
  });
}
