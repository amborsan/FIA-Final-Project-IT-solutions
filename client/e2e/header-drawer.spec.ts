import { test, expect } from "@playwright/test";
import { translations } from "../src/i18n/translations";

for (const language of ["en", "de"] as const) {
  for (const width of [360, 1066]) {
  test(`${language}, ${width}px: right drawer, Shop toggle, dismissals and navigation`, async ({ page }) => {
    const t = translations[language];
    await page.addInitScript((language) => {
      localStorage.setItem("orbit_language", language);
      localStorage.setItem("orbit_cookie_consent", "true");
    }, language);
    await page.goto("/quote");
      await page.setViewportSize({ width, height: 931 });
      const trigger = page.getByRole("button", { name: t["nav.menu"], exact: true });
      await trigger.click();
      const dialog = page.getByRole("dialog", { name: t["nav.menu"], exact: true });
      await expect(dialog).toBeVisible();
      await expect(dialog).toHaveCSS("transform", "none");
      const bounds = await dialog.boundingBox();
      expect(Math.abs(bounds!.x + bounds!.width - width)).toBeLessThan(2);
      await expect(page.locator("body")).toHaveAttribute("data-scroll-locked");
      await expect(dialog.getByRole("button", { name: t["nav.closeMenu"] })).toBeFocused();
      await page.keyboard.press("Shift+Tab");
      expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
      const shop = dialog.locator("details");
      const shopToggle = shop.locator("summary");
      const allProducts = shop.getByRole("link", { name: t["nav.allProducts"], exact: true });
      await expect(shop).not.toHaveAttribute("open");
      await expect(allProducts).toBeHidden();
      await shopToggle.click();
      await expect(shop).toHaveAttribute("open");
      await expect(allProducts).toBeVisible();
      await expect(allProducts).toHaveAttribute("href", "/products");
      await shopToggle.click();
      await expect(allProducts).toBeHidden();
      await shopToggle.focus();
      await page.keyboard.press("Enter");
      await expect(shop).toHaveAttribute("open");
      await page.keyboard.press("Space");
      await expect(shop).not.toHaveAttribute("open");
      await shopToggle.click();
      await page.keyboard.press("Escape");
      await expect(dialog).toHaveCount(0);
      await expect(trigger).toBeFocused();
      await trigger.click();
      await expect(dialog).toHaveCSS("transform", "none");
      await expect(shop).not.toHaveAttribute("open");
      await page.locator(".header-drawer-backdrop").click({ position: { x: 5, y: 450 } });
      await expect(dialog).toHaveCount(0);
      await trigger.click();
      await expect(dialog).toHaveCSS("transform", "none");
      await dialog.getByRole("link", { name: t["nav.contact"], exact: true }).click();
      await expect(page).toHaveURL(/\/contact$/);
      await expect(dialog).toHaveCount(0);
      await expect(page.locator("body")).not.toHaveAttribute("data-scroll-locked");
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      await page.emulateMedia({ reducedMotion: "reduce" });
  });
  }
}
