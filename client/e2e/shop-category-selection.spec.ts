import { expect, test, type Locator } from "@playwright/test";
import { translations } from "../src/i18n/translations";
import type { Product, ProductCategory } from "../src/lib/types";

test.use({ hasTouch: true, reducedMotion: "reduce" });
for (const language of ["en", "de"] as const) {
  test(`${language}: Header and Drawer Shop categories stay in sync with products`, async ({ page }) => {
    const t = translations[language];
    await page.addInitScript(language => {
      localStorage.setItem("orbit_language", language);
      localStorage.setItem("orbit_cookie_consent", "true");
      localStorage.setItem("orbit_theme", "light");
    }, language);
    const categoryResponse = page.waitForResponse(response => new URL(response.url()).pathname === "/api/categories");
    const productResponse = page.waitForResponse(response => new URL(response.url()).pathname === "/api/products");
    await page.goto("/products");
    const [categoryData, productData] = await Promise.all([categoryResponse, productResponse]);
    expect(categoryData.ok()).toBe(true);
    expect(productData.ok()).toBe(true);
    const { categories } = await categoryData.json() as { categories: ProductCategory[] };
    const { products } = await productData.json() as { products: Product[] };
    expect(categories.length).toBeGreaterThan(1);
    const main = page.locator("main");
    const filters = main.getByRole("group", { name: t["products.categories"], exact: true });
    const name = (category: ProductCategory) => language === "en" ? category.nameEn : category.nameDe;
    const checkSelection = async (menu: Locator, category?: ProductCategory) => {
      const selected = menu.getByRole("link", { name: category ? name(category) : t["nav.allProducts"], exact: true });
      await expect(selected).toHaveAttribute("aria-current", "page");
      await expect(selected.locator(".lucide-check")).toHaveCount(1);
      await expect(selected).toHaveCSS("background-color", "rgb(203, 239, 255)");
      await expect(menu.locator('a[aria-current="page"]')).toHaveCount(1);
    };
    for (const { device, width } of [
      { device: "header", width: 1440 }, { device: "header", width: 1280 },
      { device: "drawer", width: 320 }, { device: "drawer", width: 390 },
    ]) {
      await page.setViewportSize({ width, height: 931 });
      const header = page.locator(".site-header");
      const openShop = async () => {
        if (device === "header") {
          await header.getByRole("button", { name: t["nav.products"], exact: true }).click();
          const menu = page.locator('[data-slot="navigation-menu-content"]');
          await expect(menu).toBeVisible();
          return menu;
        }
        await header.getByRole("button", { name: t["nav.menu"], exact: true }).tap();
        const drawer = page.getByRole("dialog", { name: t["nav.menu"], exact: true });
        const shop = drawer.locator("details").filter({ has: page.locator("summary", { hasText: t["nav.products"] }) });
        await shop.locator("summary").tap();
        return shop;
      };
      const choose = async (menu: Locator, category?: ProductCategory) => {
        const link = menu.getByRole("link", { name: category ? name(category) : t["nav.allProducts"], exact: true });
        if (device === "drawer") await link.tap();
        else await link.click();
        if (device === "drawer") {
          await expect(page.getByRole("dialog")).toHaveCount(0);
          await expect(page.locator("body")).not.toHaveAttribute("data-scroll-locked");
        } else await expect(header.getByRole("button", { name: t["nav.products"], exact: true })).toHaveAttribute("aria-expanded", "false");
        await expect.poll(() => new URL(page.url()).searchParams.get("category")).toBe(category?.slug ?? null);
        const selected = filters.getByRole("button", { name: category ? name(category) : t["common.all"], exact: true });
        await expect(selected).toHaveAttribute("aria-pressed", "true");
        await expect(selected.locator(".lucide-check")).toHaveCount(1);
        await expect.poll(async () => {
          const item = await selected.boundingBox();
          const bounds = await filters.boundingBox();
          return item!.x >= bounds!.x - 1 && item!.x + item!.width <= bounds!.x + bounds!.width + 1;
        }).toBe(true);
        await expect(main.locator("article")).toHaveCount(category ? products.filter(product => product.categoryId === category.id).length : products.length);
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      };
      let menu = await openShop();
      await checkSelection(menu);
      await choose(menu, categories[0]);
      menu = await openShop();
      await checkSelection(menu, categories[0]);
      await choose(menu, categories[categories.length - 1]);
      menu = await openShop();
      await checkSelection(menu, categories[categories.length - 1]);
      if (width === 320 || width === 1440) await page.screenshot({ path: `test-results/shop-selection-${language}-${width}.png` });
      for (const link of await menu.getByRole("link").all()) {
        const box = await link.boundingBox();
        expect(box!.x).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width).toBeLessThanOrEqual(width);
      }
      await choose(menu);
    }
  });
}
