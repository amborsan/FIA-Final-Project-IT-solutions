import { expect, test } from "@playwright/test";
import { translations } from "../src/i18n/translations";
import type { Service } from "../src/lib/types";

test.use({ reducedMotion: "reduce" });
for (const language of ["en", "de"] as const) {
  test(`${language}: three service themes retain every service, price and detail link`, async ({ page }) => {
    const t = translations[language];
    await page.addInitScript(language => {
      localStorage.setItem("orbit_language", language);
      localStorage.setItem("orbit_theme", "light");
      localStorage.setItem("orbit_cookie_consent", "true");
    }, language);
    const response = await page.request.get("/api/services");
    expect(response.ok()).toBe(true);
    const { services } = await response.json() as { services: Service[] };
    expect(services).toHaveLength(10);
    await page.goto("/services");
    const main = page.locator("main");
    const cards = main.locator('button[aria-haspopup="dialog"]');
    await expect(cards).toHaveCount(10);
    for (const service of services) {
      const card = cards.filter({ hasText: language === "en" ? service.nameEn : service.nameDe });
      await expect(card).toContainText(language === "en" ? service.nameEn : service.nameDe);
      await expect(card).toContainText(language === "en" ? service.descriptionEn : service.descriptionDe);
      if (service.startingPrice) {
        const price = new Intl.NumberFormat(language === "en" ? "en-GB" : "de-DE", { style: "currency", currency: "EUR" }).format(Number(service.startingPrice));
        await expect(card).toContainText(`${t["services.startingAt"]} ${price}`);
      }
    }
    const groups = [
      { id: "connected-teams", title: t["home.topicNetworks"], count: 6 },
      { id: "secure-systems", title: t["home.topicSecurity"], count: 3 },
      { id: "business-online", title: t["home.topicWebsites"], count: 1 },
    ];
    const navigation = main.getByRole("navigation", { name: t["services.topicNavigation"], exact: true });
    await expect(navigation.getByRole("link")).toHaveCount(3);
    for (const group of groups) {
      const section = main.getByRole("region", { name: group.title, exact: true });
      await expect(section.locator('button[aria-haspopup="dialog"]')).toHaveCount(group.count);
      const link = navigation.getByRole("link", { name: group.title, exact: true });
      await link.focus();
      await link.press("Enter");
      await expect(page).toHaveURL(new RegExp(`#${group.id}$`));
      await expect(section.getByRole("heading", { name: group.title, exact: true })).toBeFocused();
    }
    const search = main.getByRole("searchbox", { name: t["services.searchLabel"], exact: true });
    await expect(search).toHaveCSS("font-size", "16px");
    await search.fill("Web & Software Development");
    await expect(cards).toHaveCount(1);
    await expect(cards).toBeVisible();
    await search.fill("no-service-matches-this-query");
    await expect(cards).toHaveCount(0);
    await expect(main.getByText(t["common.noResults"], { exact: true })).toBeVisible();
    await main.getByRole("button", { name: t["services.clearSearch"], exact: true }).click();
    await expect(cards).toHaveCount(10);
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      for (const link of await navigation.getByRole("link").all()) {
        const box = await link.boundingBox();
        expect(box!.height).toBeGreaterThanOrEqual(44);
        expect(box!.x).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width).toBeLessThanOrEqual(width);
      }
      if (width === 390 || width === 1440) {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({ path: `test-results/service-groups-${language}-${width}.png`, fullPage: true });
      }
    }
    await page.getByRole("button", { name: t["theme.switchToDark"], exact: true }).click();
    await expect(cards).toHaveCount(10);
    await expect(main.locator("h1")).toHaveCSS("color", "rgb(245, 245, 245)");
    await page.goto("/services#secure-systems");
    await expect(page.locator("#secure-systems")).toBeInViewport();
  });
}
