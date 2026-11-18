import { test, expect } from "@playwright/test";
import { translations, type TranslationKey } from "../src/i18n/translations";
import type { Service } from "../src/lib/types";

test.use({ reducedMotion: "reduce" });
for (const language of ["en", "de"] as const) {
  test(`${language}: services and grouped process retain their complete content and destinations`, async ({ page }) => {
    const t = translations[language];
    await page.addInitScript(language => {
      localStorage.setItem("orbit_language", language);
      localStorage.setItem("orbit_theme", "light");
      localStorage.setItem("orbit_cookie_consent", "true");
    }, language);
    const response = await page.request.get("/api/services");
    expect(response.ok()).toBe(true);
    const { services } = await response.json() as { services: Service[] };
    expect(services.length).toBeGreaterThan(0);
    await page.goto("/");
    const serviceSection = page.getByRole("region", { name: t["home.servicesTitle"], exact: true });
    const process = page.getByRole("region", { name: t["home.processTitle"], exact: true });
    await expect(serviceSection.locator(".service-accordion")).toBeVisible();
    await expect(serviceSection.locator('a[href^="/services/"]')).toHaveCount(services.length);
    for (const service of services) {
      const name = language === "en" ? service.nameEn : service.nameDe;
      const description = language === "en" ? service.descriptionEn : service.descriptionDe;
      const trigger = serviceSection.getByRole("button", { name, exact: true });
      if (await trigger.getAttribute("aria-expanded") !== "true") await trigger.click();
      const panel = serviceSection.getByRole("region", { name, exact: true });
      const link = panel.getByRole("link");
      await expect(link).toHaveAttribute("href", `/services/${service.slug}`);
      await expect(panel.locator("p")).toHaveText(description);
      await expect(panel.locator("p")).toHaveCSS("-webkit-line-clamp", "none");
      if (service.startingPrice) {
        const price = new Intl.NumberFormat(language === "de" ? "de-DE" : "en-GB", { style: "currency", currency: "EUR" }).format(Number(service.startingPrice));
        await expect(panel).toContainText(`${t["services.startingAt"]} ${price}`);
      }
    }
    await expect(process.getByRole("heading", { level: 3 })).toHaveCount(3);
    await expect(process.locator("ol > li")).toHaveCount(8);
    await expect(process.locator("h4")).toHaveText(Array.from({ length: 8 }, (_, index) => t[`home.step${index + 1}.title` as TranslationKey]));
    expect(await process.locator("ol").evaluateAll(lists => lists.map(list => list.getAttribute("start")))).toEqual(["1", "3", "6"]);
    for (let step = 1; step <= 8; step++) {
      await expect(process.getByRole("heading", { name: t[`home.step${step}.title` as TranslationKey], exact: true })).toBeVisible();
      await expect(process.getByText(t[`home.step${step}.text` as TranslationKey], { exact: true })).toBeVisible();
    }
    for (const width of [1440, 320, 1280, 320, 768, 320, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      // Wait for both viewport units and the responsive component to finish resizing.
      await expect.poll(() => page.locator(".hero-particle-hands").evaluate(el => Math.round(el.getBoundingClientRect().width))).toBe(width);
      await expect(serviceSection.locator(".service-accordion-column")).toHaveCount(width >= 1024 ? 2 : 1);
      // Then check three painted frames for real overflow, including transitions.
      const frames = await page.evaluate(async () => {
        const measurements = [];
        for (let frame = 0; frame < 3; frame++) {
          await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
          measurements.push({
            width: document.documentElement.scrollWidth,
            viewport: innerWidth,
            overflow: Array.from(document.querySelectorAll<HTMLElement>("body *")).filter(el => {
              const box = el.getBoundingClientRect();
              const style = getComputedStyle(el);
              return box.width > 0 && style.visibility !== "hidden" && style.display !== "none" && (box.right > innerWidth + 1 || box.left < -1);
            }).slice(0, 6).map(el => ({ tag: el.tagName, className: el.className, right: el.getBoundingClientRect().right })),
          });
        }
        return measurements;
      });
      for (const layout of frames) {
        expect(layout.viewport).toBe(width);
        expect(layout.width, JSON.stringify(layout)).toBeLessThanOrEqual(width);
      }
      if (width === 1440) {
        await serviceSection.screenshot({ path: `test-results/home-service-list-${language}-desktop.png` });
        await process.screenshot({ path: `test-results/home-process-${language}-desktop.png`, style: "header.site-header { visibility: hidden; }" });
      } else if (width === 320) {
        await serviceSection.scrollIntoViewIfNeeded();
        await page.screenshot({ path: `test-results/home-service-list-${language}-mobile.png` });
      }
    }
    await page.setViewportSize({ width: 360, height: 1000 });
    await page.getByRole("button", { name: t["theme.switchToDark"], exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "orbit-dark");
    await process.screenshot({ path: `test-results/home-process-${language}-mobile-dark.png`, style: "header.site-header { visibility: hidden; }" });
    const first = services[0];
    const firstName = language === "en" ? first.nameEn : first.nameDe;
    const firstTrigger = serviceSection.getByRole("button", { name: firstName, exact: true });
    if (await firstTrigger.getAttribute("aria-expanded") !== "true") await firstTrigger.click();
    const firstLink = serviceSection.getByRole("region", { name: firstName, exact: true }).getByRole("link");
    await firstLink.focus();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Shift+Tab");
    await expect(firstLink).toHaveCSS("outline-style", "solid");
    await page.keyboard.press("Enter");
    await expect.poll(() => new URL(page.url()).pathname).toBe(`/services/${first.slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
}
