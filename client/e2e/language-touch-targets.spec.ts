import { expect, test, type Locator } from "@playwright/test";
import { translations } from "../src/i18n/translations";

test.use({ hasTouch: true, reducedMotion: "reduce" });
for (const language of ["en", "de"] as const) {
  test(`${language}: language controls retain text size with 44px touch targets`, async ({ page }) => {
    const t = translations[language];
    const other = language === "en" ? "de" : "en";
    await page.addInitScript(language => {
      localStorage.setItem("orbit_language", language);
      localStorage.setItem("orbit_cookie_consent", "true");
      localStorage.setItem("orbit_theme", "light");
    }, language);
    await page.goto("/quote");
    await page.evaluate(() => document.fonts.ready);
    const header = page.locator(".site-header");
    const brandWidth = (await header.locator(".brand-lockup").boundingBox())!.width;
    const checkTargets = async (container: Locator, width: number) => {
      for (const label of ["EN", "DE"]) {
        const button = container.getByRole("button", { name: label, exact: true });
        const box = await button.boundingBox();
        expect(box!.width).toBeGreaterThanOrEqual(44);
        expect(box!.height).toBeGreaterThanOrEqual(44);
        expect(box!.x).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width).toBeLessThanOrEqual(width);
        await expect(button).toHaveCSS("font-size", "12px");
      }
      await container.getByRole("button", { name: other.toUpperCase(), exact: true }).tap();
      await expect(page.locator("html")).toHaveAttribute("lang", other);
      await expect(container.getByRole("button", { name: other.toUpperCase(), exact: true })).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("main h1")).toHaveText(translations[other]["quote.title"]);
      await container.getByRole("button", { name: language.toUpperCase(), exact: true }).tap();
      await expect(page.locator("html")).toHaveAttribute("lang", language);
      await expect(container.getByRole("button", { name: language.toUpperCase(), exact: true })).toHaveAttribute("aria-pressed", "true");
    };
    for (const width of [320, 390, 640, 768, 1024, 1280, 1440]) {
      await page.setViewportSize({ width, height: 931 });
      await test.step(`${width}px header and drawer`, async () => {
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
        expect((await header.locator(".brand-lockup").boundingBox())!.width).toBeCloseTo(brandWidth, 1);
        const headerLanguage = header.getByRole("button", { name: "EN", exact: true });
        if (await headerLanguage.isVisible()) {
          await checkTargets(header, width);
          const box = await headerLanguage.boundingBox();
          const headerBox = await header.boundingBox();
          expect(box!.y).toBeGreaterThanOrEqual(headerBox!.y);
          expect(box!.y + box!.height).toBeLessThanOrEqual(headerBox!.y + headerBox!.height);
        }
        if (width < 1280) {
          await header.getByRole("button", { name: t["nav.menu"], exact: true }).tap();
          const drawer = page.locator(".header-drawer-panel");
          await expect(drawer).toBeVisible();
          await checkTargets(drawer, width);
          expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
          if (width === 320) await page.screenshot({ path: `test-results/language-touch-${language}-320.png` });
          await drawer.getByRole("button", { name: t["nav.closeMenu"], exact: true }).tap();
          await expect(drawer).toHaveCount(0);
        }
      });
    }
  });
}
