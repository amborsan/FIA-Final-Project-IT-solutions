import { test, expect } from "@playwright/test";
import { translations } from "../src/i18n/translations";

for (const language of ["en", "de"] as const) {
  test(`${language}: branded CTA hover preserves size and destinations`, async ({ page }) => {
    await page.addInitScript(language => {
      localStorage.setItem("orbit_language", language);
      localStorage.setItem("orbit_cookie_consent", "true");
    }, language);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const t = translations[language];
    const primary = page.getByRole("link", { name: t["home.ctaQuote"], exact: true }).first();
    const secondary = page.getByRole("link", { name: t["home.ctaServices"], exact: true }).first();
    const primarySize = await primary.boundingBox();
    const secondarySize = await secondary.boundingBox();
    await primary.hover();
    await expect(primary.locator(".home-hero-cta-arrow")).toHaveCSS("opacity", "0");
    await expect(primary.locator(".home-hero-cta-mark")).toHaveCSS("opacity", "1");
    await expect(primary.locator("i").first()).toHaveCSS("transform", "none");
    expect(await primary.boundingBox()).toEqual(primarySize);
    await secondary.hover();
    await expect(primary.locator(".home-hero-cta-arrow")).toHaveCSS("opacity", "1");
    await expect(primary.locator(".home-hero-cta-mark")).toHaveCSS("opacity", "0");
    await expect(secondary.locator(".home-hero-cta-arrow")).toHaveCSS("transform", "matrix(1, 0, 0, 1, 4, 0)");
    await expect(secondary).toHaveCSS("color", "rgb(245, 245, 245)");
    expect(await secondary.boundingBox()).toEqual(secondarySize);
    await expect(primary).toHaveAttribute("href", "/quote");
    await expect(secondary).toHaveAttribute("href", "/services");
    await page.screenshot({ path: `test-results/hero-cta-${language}.png` });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(secondary.locator(".home-hero-cta-arrow")).toHaveCSS("transform", "none");
    expect(await primary.locator(".home-hero-cta-arrow").evaluate(el => parseFloat(getComputedStyle(el).transitionDuration))).toBeLessThanOrEqual(0.001);
  });
}
