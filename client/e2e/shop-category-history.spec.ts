import { expect, test, type Locator } from "@playwright/test";
import { translations } from "../src/i18n/translations";
import type { Product, ProductCategory } from "../src/lib/types";

test.use({ hasTouch: true, reducedMotion: "reduce" });
for (const language of ["en", "de"] as const) {
  test(`${language}: category state survives refresh, history and every All products entry`, async ({ page }) => {
    test.setTimeout(90_000);
    const t = translations[language];
    await page.addInitScript(language => {
      localStorage.setItem("orbit_language", language);
      localStorage.setItem("orbit_cookie_consent", "true");
      localStorage.setItem("orbit_theme", "light");
    }, language);
    const categoriesResponse = page.waitForResponse(response => new URL(response.url()).pathname === "/api/categories");
    const productsResponse = page.waitForResponse(response => new URL(response.url()).pathname === "/api/products");
    await page.goto("/products");
    const [categoryData, productData] = await Promise.all([categoriesResponse, productsResponse]);
    expect(categoryData.ok()).toBe(true);
    expect(productData.ok()).toBe(true);
    const { categories } = await categoryData.json() as { categories: ProductCategory[] };
    const { products } = await productData.json() as { products: Product[] };
    expect(categories.length).toBeGreaterThan(1);
    const first = categories[0];
    const last = categories[categories.length - 1];
    const name = (category: ProductCategory) => language === "en" ? category.nameEn : category.nameDe;
    const header = page.locator(".site-header");
    const filters = page.locator("main").getByRole("group", { name: t["products.categories"], exact: true });
    const openShop = async (width: number): Promise<Locator> => {
      await page.setViewportSize({ width, height: 931 });
      if (width >= 1280) {
        await header.getByRole("button", { name: t["nav.products"], exact: true }).click();
        return page.locator('[data-slot="navigation-menu-content"]');
      }
      await header.getByRole("button", { name: t["nav.menu"], exact: true }).tap();
      const drawer = page.getByRole("dialog", { name: t["nav.menu"], exact: true });
      const shop = drawer.locator("details").filter({ has: page.locator("summary", { hasText: t["nav.products"] }) });
      await shop.locator("summary").tap();
      return shop;
    };
    const chooseFromMenu = async (width: number, category?: ProductCategory) => {
      const menu = await openShop(width);
      await menu.getByRole("link", { name: category ? name(category) : t["nav.allProducts"], exact: true }).click();
      if (width < 1280) await expect(page.getByRole("dialog")).toHaveCount(0);
      else await expect(header.getByRole("button", { name: t["nav.products"], exact: true })).toHaveAttribute("aria-expanded", "false");
    };
    const checkState = async (category?: ProductCategory) => {
      await expect.poll(() => new URL(page.url()).searchParams.get("category")).toBe(category?.slug ?? null);
      await expect(page.locator("main article")).toHaveCount(category ? products.filter(product => product.categoryId === category.id).length : products.length);
      for (const width of [1440, 320]) {
        await page.setViewportSize({ width, height: 931 });
        const selected = filters.getByRole("button", { name: category ? name(category) : t["common.all"], exact: true });
        await expect(selected).toHaveAttribute("aria-pressed", "true");
        await expect(selected.locator(".lucide-check")).toHaveCount(1);
        await expect(filters.locator('[aria-pressed="true"]')).toHaveCount(1);
        await expect.poll(async () => {
          const item = await selected.boundingBox();
          const bounds = await filters.boundingBox();
          return item!.x >= bounds!.x - 1 && item!.x + item!.width <= bounds!.x + bounds!.width + 1;
        }).toBe(true);
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
        const menu = await openShop(width);
        const current = menu.getByRole("link", { name: category ? name(category) : t["nav.allProducts"], exact: true });
        await expect(current).toHaveAttribute("aria-current", "page");
        await expect(current.locator(".lucide-check")).toHaveCount(1);
        await expect(menu.locator('a[aria-current="page"]')).toHaveCount(1);
        for (const link of await menu.getByRole("link").all()) {
          const bounds = await link.boundingBox();
          expect(bounds!.x).toBeGreaterThanOrEqual(0);
          expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
        }
        // Dismiss from inside the inspected menu, with keyboard focus established.
        await current.focus();
        await page.keyboard.press("Escape");
        if (width < 1280) {
          await expect(page.getByRole("dialog")).toHaveCount(0);
          await expect(page.locator("body")).not.toHaveAttribute("data-scroll-locked");
        } else await expect(header.getByRole("button", { name: t["nav.products"], exact: true })).toHaveAttribute("aria-expanded", "false");
      }
    };
    await test.step("initial All products", () => checkState());
    await chooseFromMenu(1440, first);
    await test.step("Header selection", () => checkState(first));
    await page.reload();
    await test.step("refresh selected category", () => checkState(first));
    await chooseFromMenu(320, last);
    await test.step("Drawer selection", () => checkState(last));
    await page.goBack();
    await test.step("Back returns to first category", () => checkState(first));
    await page.goForward();
    await test.step("Forward restores last category", () => checkState(last));
    await filters.getByRole("button", { name: t["common.all"], exact: true }).click();
    await test.step("product page All", () => checkState());
    await page.goBack();
    await test.step("Back from All", () => checkState(last));
    await page.goForward();
    await test.step("Forward to All", () => checkState());
    await page.reload();
    await test.step("refresh All products", () => checkState());
    await filters.getByRole("button", { name: name(first), exact: true }).click();
    await chooseFromMenu(1440);
    await test.step("Header All products", () => checkState());
    await filters.getByRole("button", { name: name(last), exact: true }).click();
    await chooseFromMenu(320);
    await test.step("Drawer All products", () => checkState());
  });
}
