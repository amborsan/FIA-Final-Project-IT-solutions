import { test, expect } from "@playwright/test";
import { translations } from "../src/i18n/translations";

for (const language of ["en", "de"] as const) {
  test(`${language}: header navigation panels, keyboard, themes and mobile links`, async ({ page }) => {
    const t = translations[language];
    await page.addInitScript(language => {
      localStorage.setItem("orbit_language", language);
      localStorage.setItem("orbit_theme", "light");
      localStorage.setItem("orbit_cookie_consent", "true");
    }, language);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/login");
    const trigger = page.getByRole("button", { name: t["nav.services"], exact: true });
    const fits = async () => expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);
    for (const width of [1440, 1280]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const theme of ["light", "dark"] as const) {
        await page.locator("html").evaluate((el, value) => el.setAttribute("data-theme", value), theme === "dark" ? "orbit-dark" : "orbit");
        await trigger.focus();
        await page.keyboard.press("Enter");
        await expect(trigger).toHaveAttribute("aria-expanded", "true");
        await expect(trigger).toHaveCSS("font-weight", "600");
        const panel = page.locator('[data-slot="navigation-menu-content"]');
        await expect(panel).toBeVisible();
        await expect(panel).toHaveCSS("opacity", "1");
        await expect(panel.getByRole("link", { name: t["nav.allServices"], exact: true })).toHaveAttribute("href", "/services");
        const bounds = await panel.boundingBox();
        expect(bounds!.x).toBeGreaterThanOrEqual(0);
        expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
        await fits();
        if (width === 1440) await page.screenshot({ path: `test-results/navbar-${language}-${theme}-desktop.png` });
        await page.keyboard.press("ArrowDown");
        await expect.poll(() => panel.evaluate(el => el.contains(document.activeElement))).toBe(true);
        await page.keyboard.press("Escape");
        await expect(trigger).toHaveAttribute("aria-expanded", "false");
        await expect(trigger).toBeFocused();
      }
    }
    // Follow a service theme into its catalogue section.
    await trigger.focus();
    await page.keyboard.press("Enter");
    const service = page.locator('[data-slot="navigation-menu-content"] a[href^="/services#"]').first();
    await expect(service).toBeVisible();
    const href = await service.getAttribute("href");
    await service.click();
    await expect.poll(() => new URL(page.url()).pathname + new URL(page.url()).hash).toBe(href);
    await expect(page.locator("h1")).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    for (const width of [1113, 768, 360]) {
      await page.setViewportSize({ width, height: 931 });
      const menu = page.getByRole("button", { name: t["nav.menu"], exact: true });
      await menu.click();
      const nav = page.getByRole("navigation", { name: t["nav.primary"], exact: true });
      await expect(nav.locator("summary", { hasText: t["nav.services"] })).toBeVisible();
      await fits();
      if (width === 360) await page.screenshot({ path: `test-results/navbar-${language}-mobile.png` });
      await page.keyboard.press("Escape");
      await expect(menu).toHaveAttribute("aria-expanded", "false");
      await expect(menu).toBeFocused();
    }
  });
}
