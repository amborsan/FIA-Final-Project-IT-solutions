import { test, expect } from "@playwright/test";
import { translations } from "../src/i18n/translations";

for (const language of ["en", "de"] as const) {
  test(`${language}: footer separates its CTA, navigation and legal information`, async ({ page }) => {
    const t = translations[language];
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(language => {
      localStorage.setItem("orbit_language", language);
      localStorage.setItem("orbit_theme", "light");
      localStorage.setItem("orbit_cookie_consent", "true");
    }, language);
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByRole("heading", { name: t["footer.ctaTitle"], exact: true })).toBeVisible();
    await expect(footer.getByRole("link", { name: t["home.ctaQuote"], exact: true })).toHaveAttribute("href", "/quote");
    await expect(footer.getByRole("link", { name: t["brand.name"], exact: true })).toHaveAttribute("href", "/");
    await expect(footer.locator('a[href="tel:+493055500100"]')).toBeVisible();
    await expect(footer.locator('a[href="mailto:hello@fia-it.de"]')).toBeVisible();
    await expect(footer.getByRole("navigation", { name: t["footer.company"], exact: true }).getByRole("link")).toHaveCount(5);
    const legal = footer.getByRole("navigation", { name: t["footer.legal"], exact: true });
    for (const path of ["privacy", "terms", "withdrawal", "imprint", "cookies"]) {
      await expect(legal.locator(`a[href="/legal/${path}"]`)).toBeVisible();
    }
    await expect(footer.getByText(t["footer.demo"], { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: t["footer.ctaTitle"], exact: true })).toHaveCount(1);
    for (const width of [1440, 1024, 768, 360, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await footer.scrollIntoViewIfNeeded();
      const layout = await footer.evaluate(el => {
        const rect = (selector: string) => {
          const box = el.querySelector(selector)!.getBoundingClientRect();
          return { x: box.x, top: box.top, bottom: box.bottom, right: box.right };
        };
        return { cta: rect(".footer-cta"), main: rect(".footer-main"), legal: rect(".footer-legal"), brand: rect(".footer-main > div"), nav: rect(".footer-navigation") };
      });
      expect(layout.cta.bottom).toBeLessThanOrEqual(layout.main.top);
      expect(layout.main.bottom).toBeLessThanOrEqual(layout.legal.top);
      if (width >= 1024) expect(layout.nav.x).toBeGreaterThan(layout.brand.right);
      else expect(layout.nav.top).toBeGreaterThan(layout.brand.bottom);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      if (width === 1440 || width === 360) await footer.screenshot({ path: `test-results/footer-${language}-${width}.png`, style: "header.site-header, header.site-header * { visibility: hidden !important; }" });
    }
    await page.locator("html").evaluate(el => el.setAttribute("data-theme", "orbit-dark"));
    await footer.screenshot({ path: `test-results/footer-${language}-dark.png`, style: "header.site-header, header.site-header * { visibility: hidden !important; }" });
    const settings = legal.getByRole("button", { name: t["legal.cookieSettings"], exact: true });
    await settings.click();
    const cookieNotice = page.getByRole("region", { name: t["cookie.title"], exact: true });
    await expect(cookieNotice).toBeVisible();
    await expect(cookieNotice.getByRole("heading", { name: t["cookie.title"], exact: true })).toBeFocused();
    await cookieNotice.getByRole("button", { name: t["cookie.acknowledge"], exact: true }).click();
    await expect(cookieNotice).toBeHidden();
    await expect(settings).toBeFocused();
    await legal.getByRole("link", { name: t["footer.privacy"], exact: true }).click();
    await expect.poll(() => new URL(page.url()).pathname).toBe("/legal/privacy");
  });
}
