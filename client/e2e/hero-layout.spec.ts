import { test, expect } from "@playwright/test";
import { translations } from "../src/i18n/translations";

test.use({ reducedMotion: "reduce" });
for (const language of ["en", "de"] as const) {
  test(`${language}: hero explains services and uses a compact mobile flow`, async ({ page }) => {
    const t = translations[language];
    await page.addInitScript(language => {
      localStorage.setItem("orbit_language", language);
      localStorage.setItem("orbit_theme", "light");
      localStorage.setItem("orbit_cookie_consent", "true");
    }, language);
    await page.goto("/");
    const brand = page.locator(".site-header .brand-lockup");
    const tile = brand.locator(".brand-symbol i").first();
    await expect(brand.locator(".brand-symbol i")).toHaveCount(4);
    await expect(tile).toHaveCSS("transform", "none");
    await brand.hover();
    await expect(tile).toHaveCSS("transform", /matrix/);
    await page.mouse.move(0, 0);
    await expect(tile).toHaveCSS("transform", "none");
    const hero = page.locator(".home-hero");
    const lede = hero.getByText(t["home.heroText"], { exact: true });
    for (const width of [320, 360, 390, 768, 1066, 1440, 1920]) {
      await page.setViewportSize({ width, height: width >= 1024 ? 900 : 800 });
      await expect(lede).toBeVisible();
      await expect(hero).toHaveCSS("background-image", /linear-gradient/);
      await expect.poll(async () => {
        const box = await hero.locator(".hero-particle-hands").boundingBox();
        return { x: Math.round(box!.x), width: Math.round(box!.width) };
      }).toEqual({ x: 0, width });
      const geometry = await hero.evaluate(el => {
        const r = (selector: string) => {
          const box = el.querySelector(selector)!.getBoundingClientRect();
          return { top: box.top, bottom: box.bottom, height: box.height };
        };
        return { heading: r(".home-hero-heading"), art: r(".home-hero-artwork"), topics: r(".home-hero-topics"), layout: r(".home-hero-layout") };
      });
      if (width < 1024) {
        expect(geometry.art.top).toBeGreaterThanOrEqual(geometry.heading.bottom);
        expect(geometry.art.top - geometry.heading.bottom).toBeLessThanOrEqual(24);
        expect(geometry.topics.top - geometry.art.bottom).toBeLessThanOrEqual(24);
      }
      const quote = hero.getByRole("link", { name: t["home.ctaQuote"], exact: true });
      await expect(quote).toHaveAttribute("href", "/quote");
      expect((await quote.boundingBox())!.y + (await quote.boundingBox())!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      if (width >= 1024 || width === 360 || width === 390) {
        const stats = await page.locator(".home-hero-stats").boundingBox();
        expect(stats!.y + stats!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
      }
      if ([360, 1440].includes(width)) await page.screenshot({ path: `test-results/hero-layout-${language}-${width}-light.png` });
    }
    await page.setViewportSize({ width: 360, height: 800 });
    await page.getByRole("button", { name: t["theme.switchToDark"], exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "orbit-dark");
    await expect(lede).toBeVisible();
    await expect.poll(() => page.locator(".hero-particle-hands").evaluate((canvas: HTMLCanvasElement) => {
      const pixels = canvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height).data;
      let lightPixels = 0;
      for (let index = 0; index < pixels.length; index += 4) {
        if (pixels[index] > 128 && pixels[index + 3] > 16) lightPixels++;
      }
      return lightPixels;
    })).toBeGreaterThan(100);
    await page.screenshot({ path: `test-results/hero-layout-${language}-360-dark.png` });
  });
}
