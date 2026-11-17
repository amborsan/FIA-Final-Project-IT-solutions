import { test, expect } from "@playwright/test";
import { translations } from "../src/i18n/translations";

for (const language of ["en", "de"] as const) {
  test(`${language}: Grainient renders behind the hero and respects reduced motion`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.addInitScript(language => {
      localStorage.setItem("orbit_language", language);
      localStorage.setItem("orbit_theme", "light");
      localStorage.setItem("orbit_cookie_consent", "true");
    }, language);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/");
    const hero = page.locator(".home-hero");
    const canvas = hero.locator(".grainient-canvas");
    await expect(canvas).toHaveAttribute("data-ready", "true");
    await expect(hero.locator(".home-hero-gradient")).toHaveCSS("position", "absolute");
    await expect(hero).toHaveCSS("color", "rgb(245, 245, 245)");
    await expect(hero.locator("h1")).toHaveCSS("font-size", "51.84px");
    await page.waitForTimeout(1800);
    await page.screenshot({ path: `test-results/grainient-${language}-desktop.png` });
    const animated = await canvas.screenshot();
    await page.waitForTimeout(350);
    expect(animated.equals(await canvas.screenshot())).toBe(false);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.waitForTimeout(200);
    const still = await canvas.screenshot();
    await page.waitForTimeout(350);
    expect(still.equals(await canvas.screenshot())).toBe(true);
    for (const width of [360, 768]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(canvas).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      await page.screenshot({ path: `test-results/grainient-${language}-${width}.png` });
    }
    await hero.getByRole("link", { name: translations[language]["home.ctaQuote"], exact: true }).click();
    await expect(page).toHaveURL(/\/quote$/);
    await expect(page.locator(".grainient-container")).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}

