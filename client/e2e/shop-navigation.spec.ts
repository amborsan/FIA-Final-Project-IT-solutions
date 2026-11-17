import { test, expect } from "@playwright/test";
import { translations } from "../src/i18n/translations";

for (const language of ["en", "de"] as const) {
  test(`${language}: Shop categories filter products and survive reload and history`, async ({ page }) => {
    const t = translations[language];
    await page.addInitScript(language => {
      localStorage.setItem("orbit_language", language);
      localStorage.setItem("orbit_theme", "light");
      localStorage.setItem("orbit_cookie_consent", "true");
    }, language);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/products");
    const trigger = page.getByRole("button", { name: t["nav.products"], exact: true });
    const panel = page.locator('[data-slot="navigation-menu-content"]');
    const open = async () => {
      await trigger.focus(); await page.keyboard.press("Enter");
      await expect(panel).toHaveCSS("opacity", "1");
    };
    await open();
    const categories = panel.locator('a[href*="category="]');
    await expect(categories.first()).toBeVisible();
    const firstName = (await categories.first().innerText()).trim();
    const firstUrl = await categories.first().getAttribute("href");
    const firstSlug = new URL(firstUrl!, page.url()).searchParams.get("category");
    const count = await categories.count();
    expect(count).toBeGreaterThan(1);
    for (const theme of ["light", "dark"]) {
      await page.locator("html").evaluate((el, value) => el.setAttribute("data-theme", value), theme === "dark" ? "orbit-dark" : "orbit");
      const bounds = await panel.boundingBox();
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(1440);
      await page.screenshot({ path: `test-results/shop-${language}-${theme}-desktop.png` });
    }
    await categories.first().click();
    await expect.poll(() => new URL(page.url()).searchParams.get("category")).toBe(firstSlug);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByRole("button", { name: firstName, exact: true })).toHaveAttribute("aria-pressed", "true");
    // All visible product cards belong to the chosen category.
    const cards = page.locator("main article");
    await expect(cards.first()).toBeVisible();
    for (const card of await cards.all()) await expect(card.getByText(firstName, { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByRole("button", { name: firstName, exact: true })).toHaveAttribute("aria-pressed", "true");
    await open();
    await expect(panel.locator('a[aria-current="page"]')).toHaveAttribute("href", firstUrl!);
    const secondName = (await categories.nth(1).innerText()).trim();
    await categories.nth(1).click();
    await expect(page.getByRole("button", { name: secondName, exact: true })).toHaveAttribute("aria-pressed", "true");
    await page.goBack();
    await expect(page.getByRole("button", { name: firstName, exact: true })).toHaveAttribute("aria-pressed", "true");
    await open();
    await panel.getByRole("link", { name: t["nav.allProducts"], exact: true }).click();
    await expect.poll(() => new URL(page.url()).searchParams.get("category")).toBeNull();
    await expect(page.getByRole("button", { name: t["common.all"], exact: true })).toHaveAttribute("aria-pressed", "true");
    await page.setViewportSize({ width: 360, height: 931 });
    const menu = page.getByRole("button", { name: t["nav.menu"], exact: true });
    await menu.click();
    const nav = page.getByRole("navigation", { name: t["nav.primary"], exact: true });
    await expect(nav.locator('a[href*="category="]')).toHaveCount(count);
    await page.screenshot({ path: `test-results/shop-${language}-mobile.png` });
    await nav.locator('a[href*="category="]').first().click();
    await expect(menu).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByRole("button", { name: firstName, exact: true })).toHaveAttribute("aria-pressed", "true");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  });
}
