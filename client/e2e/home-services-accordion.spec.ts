import { test, expect } from "@playwright/test";
import { translations } from "../src/i18n/translations";
import type { Service } from "../src/lib/types";

for (const language of ["en", "de"] as const) {
  test(`${language}: service accordion retains descriptions, prices and destinations`, async ({ page }) => {
    const t = translations[language];
    await page.addInitScript(language => {
      localStorage.setItem("orbit_language", language);
      localStorage.setItem("orbit_theme", "light");
      localStorage.setItem("orbit_cookie_consent", "true");
    }, language);
    await page.setViewportSize({ width: 1440, height: 1000 });
    const response = await page.request.get("/api/services");
    expect(response.ok()).toBe(true);
    const { services } = await response.json() as { services: Service[] };
    expect(services.length).toBeGreaterThan(1);
    await page.goto("/");
    const section = page.getByRole("region", { name: t["home.servicesTitle"], exact: true });
    const accordion = section.locator(".service-accordion");
    await expect(accordion.locator(".service-accordion-column")).toHaveCount(2);
    await expect(accordion.locator(".service-accordion-column").first().getByRole("heading", { level: 3 })).toHaveCount(Math.ceil(services.length / 2));
    const columns = await accordion.locator(".service-accordion-column").evaluateAll(elements => elements.map(element => {
      const box = element.getBoundingClientRect();
      return { x: box.x, right: box.right };
    }));
    expect(columns[1].x).toBeGreaterThan(columns[0].right);
    const name = (service: Service) => language === "en" ? service.nameEn : service.nameDe;
    const trigger = (service: Service) => accordion.getByRole("button", { name: name(service), exact: true });
    await expect(accordion.getByRole("heading", { level: 3 })).toHaveCount(services.length);
    await expect(trigger(services[0])).toHaveAttribute("aria-expanded", "true");
    for (const service of services) {
      if (await trigger(service).getAttribute("aria-expanded") !== "true") await trigger(service).click();
      await expect(trigger(service)).toHaveAttribute("aria-expanded", "true");
      const panel = accordion.getByRole("region", { name: name(service), exact: true });
      await expect(panel.locator(":scope > div")).toHaveCSS("opacity", "1");
      await expect(panel.getByText(language === "en" ? service.descriptionEn : service.descriptionDe, { exact: true })).toBeVisible();
      const link = panel.getByRole("link");
      await expect(link).toHaveAttribute("href", `/services/${service.slug}`);
      if (service.startingPrice) {
        const price = new Intl.NumberFormat(language === "de" ? "de-DE" : "en-GB", { style: "currency", currency: "EUR" }).format(Number(service.startingPrice));
        await expect(panel).toContainText(`${t["services.startingAt"]} ${price}`);
      }
      await expect(accordion.locator('button[aria-expanded="true"]')).toHaveCount(1);
    }
    await section.screenshot({ path: `test-results/services-accordion-${language}-desktop.png`, style: "header.site-header, header.site-header * { visibility: hidden !important; }" });
    await page.setViewportSize({ width: 320, height: 1000 });
    await expect(accordion.locator(".service-accordion-column")).toHaveCount(1);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.locator("html").evaluate(el => el.setAttribute("data-theme", "orbit-dark"));
    const first = trigger(services[0]);
    await first.click();
    await first.focus();
    await page.keyboard.press("Enter");
    await expect(first).toHaveAttribute("aria-expanded", "false");
    const closedPanel = page.locator(`[id="${await first.getAttribute("aria-controls")}"]`);
    await expect(closedPanel).toHaveAttribute("inert", "");
    await page.keyboard.press("Tab");
    await expect(trigger(services[1])).toBeFocused();
    await first.focus();
    await page.keyboard.press("Space");
    await expect(first).toHaveAttribute("aria-expanded", "true");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    await section.screenshot({ path: `test-results/services-accordion-${language}-mobile-dark.png`, style: "header.site-header, header.site-header * { visibility: hidden !important; }" });
    await accordion.getByRole("region", { name: name(services[0]), exact: true }).getByRole("link").click();
    await expect.poll(() => new URL(page.url()).pathname).toBe(`/services/${services[0].slug}`);
  });
}
