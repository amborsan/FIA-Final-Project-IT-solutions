import { test, expect } from "@playwright/test";
import { translations } from "../src/i18n/translations";

for (const language of ["en", "de"] as const) {
  test(`${language}: back arrows move left without resizing links`, async ({ page }) => {
    await page.addInitScript(language => {
      localStorage.setItem("orbit_language", language);
      localStorage.setItem("orbit_cookie_consent", "true");
    }, language);
    for (const listing of ["/services", "/products"]) {
      await page.goto(listing);
      await page.locator(`main a[href^="${listing}/"]`).first().click();
      const back = page.locator(`main a[href="${listing}"]:has(.lucide-arrow-left)`).first();
      const arrow = back.locator(".lucide-arrow-left");
      await expect(back).toBeVisible();
      const size = await back.boundingBox();
      await back.hover();
      await expect(arrow).toHaveCSS("transform", "matrix(1, 0, 0, 1, -4, 0)");
      const hovered = await back.boundingBox();
      expect(hovered?.width).toBe(size?.width);
      expect(hovered?.height).toBe(size?.height);
      await page.mouse.move(0, 0);
      await expect(arrow).toHaveCSS("transform", "none");
      await back.focus();
      await page.keyboard.press("Tab");
      await page.keyboard.press("Shift+Tab");
      await expect(arrow).toHaveCSS("transform", "matrix(1, 0, 0, 1, -4, 0)");
      await page.emulateMedia({ reducedMotion: "reduce" });
      await expect(arrow).toHaveCSS("transform", "none");
      await back.click();
      await expect(page).toHaveURL(new RegExp(`${listing}/?$`));
      await page.emulateMedia({ reducedMotion: "no-preference" });
    }
  });

  test(`${language}: CTA arrows share feedback across pages`, async ({ page }) => {
    await page.addInitScript(language => {
      localStorage.setItem("orbit_language", language);
      localStorage.setItem("orbit_cookie_consent", "true");
    }, language);
    for (const path of ["/services", "/about", "/products"]) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const cta = page.locator(path === "/products"
        ? 'footer a[href="/quote"]'
        : 'main a[href="/quote"]:has(.lucide-arrow-right)').first();
      const arrow = cta.locator(".lucide-arrow-right");
      await cta.scrollIntoViewIfNeeded();
      const size = await cta.boundingBox();
      await cta.hover();
      await expect(arrow).toHaveCSS("transform", "matrix(1, 0, 0, 1, 4, 0)");
      const hovered = await cta.boundingBox();
      expect(hovered?.width).toBe(size?.width);
      expect(hovered?.height).toBe(size?.height);
      await page.mouse.move(0, 0);
      await expect(arrow).toHaveCSS("transform", "none");
      await cta.focus();
      await page.keyboard.press("Tab");
      await page.keyboard.press("Shift+Tab");
      await expect(arrow).toHaveCSS("transform", "matrix(1, 0, 0, 1, 4, 0)");
      await page.emulateMedia({ reducedMotion: "reduce" });
      await expect(arrow).toHaveCSS("transform", "none");
      await expect(cta).toHaveAttribute("href", "/quote");
      await page.emulateMedia({ reducedMotion: "no-preference" });
    }
  });

  test(`${language}: branded CTA hover preserves size and destinations`, async ({ page }) => {
    await page.addInitScript(language => {
      localStorage.setItem("orbit_language", language);
      localStorage.setItem("orbit_cookie_consent", "true");
    }, language);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const t = translations[language];
    const hero = page.locator(".home-hero");
    const primary = hero.getByRole("link", { name: t["home.ctaQuote"], exact: true });
    const secondary = hero.getByRole("link", { name: t["home.ctaServices"], exact: true });
    const primarySize = await primary.boundingBox();
    const secondarySize = await secondary.boundingBox();
    await primary.hover();
    await expect(primary.locator(".home-hero-cta-arrow")).toHaveCSS("transform", "matrix(1, 0, 0, 1, 4, 0)");
    await expect(primary.locator(".home-hero-cta-arrow")).toHaveCSS("opacity", "1");
    await expect(primary.locator(".home-hero-cta-mark")).toHaveCount(0);
    expect(await primary.boundingBox()).toEqual(primarySize);
    await secondary.hover();
    await expect(primary.locator(".home-hero-cta-arrow")).toHaveCSS("opacity", "1");
    await expect(primary.locator(".home-hero-cta-arrow")).toHaveCSS("transform", "none");
    await expect(secondary.locator(".home-hero-cta-arrow")).toHaveCSS("transform", "matrix(1, 0, 0, 1, 4, 0)");
    await expect(secondary).toHaveCSS("color", "rgb(245, 245, 245)");
    expect(await secondary.boundingBox()).toEqual(secondarySize);
    await expect(primary).toHaveAttribute("href", "/quote");
    await expect(secondary).toHaveAttribute("href", "/services");
    await page.screenshot({ path: `test-results/hero-cta-${language}.png` });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(secondary.locator(".home-hero-cta-arrow")).toHaveCSS("transform", "none");
    await primary.hover();
    await expect(primary.locator(".home-hero-cta-arrow")).toHaveCSS("transform", "none");
    expect(await primary.locator(".home-hero-cta-arrow").evaluate(el => parseFloat(getComputedStyle(el).transitionDuration))).toBeLessThanOrEqual(0.001);
  });
}
