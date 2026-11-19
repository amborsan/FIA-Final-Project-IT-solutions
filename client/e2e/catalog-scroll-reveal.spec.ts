import { expect, test } from "@playwright/test";
import { translations } from "../src/i18n/translations";

for (const language of ["en", "de"] as const) {
  test(`${language}: catalogue blur-in preserves filters, cards and category anchors`, async ({ page }) => {
    const t = translations[language];
    await page.addInitScript(language => {
      localStorage.setItem("orbit_language", language);
      localStorage.setItem("orbit_cookie_consent", "true");
      localStorage.setItem("orbit_theme", "light");
    }, language);
    await page.setViewportSize({ width: 1280, height: 931 });
    await page.goto("/services");
    const reveals = page.locator('main [data-slot="scroll-reveal"]');
    await expect(reveals).toHaveCount(6);
    const lastGroup = page.getByRole("region", { name: t["home.topicWebsites"], exact: true });
    const reveal = lastGroup.locator('[data-slot="scroll-reveal"]');
    await expect(reveal).toHaveAttribute("data-revealed", "false");
    await expect(reveal).toHaveCSS("filter", "blur(8px)");
    await page.getByRole("navigation", { name: t["services.topicNavigation"] }).getByRole("link", { name: t["home.topicWebsites"], exact: true }).click();
    await expect(page).toHaveURL(/#business-online$/);
    await expect(reveal).toHaveAttribute("data-revealed", "true");
    await expect(reveal).toHaveCSS("filter", "blur(0px)");
    const title = page.locator("#business-online");
    const headerBottom = await page.locator("header.site-header").evaluate(el => el.getBoundingClientRect().bottom);
    expect((await title.boundingBox())!.y).toBeGreaterThanOrEqual(headerBottom + 8);
    await lastGroup.getByRole("button").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page.screenshot({ path: `test-results/services-reveal-${language}-desktop.png` });

    await page.goto("/products?category=network");
    await expect(reveals).toHaveCount(3);
    await expect(page.locator("main article")).toHaveCount(4);
    const grid = reveals.last();
    await grid.scrollIntoViewIfNeeded();
    await expect(grid).toHaveCSS("filter", "blur(0px)");
    const search = page.getByRole("textbox", { name: t["products.searchLabel"], exact: true });
    await search.fill("FRITZ");
    await expect(page.locator("main article")).toHaveCount(1);
    await expect(grid).toHaveAttribute("data-revealed", "true");
    await expect(grid).toHaveCSS("opacity", "1");
    await search.fill("");
    await expect(page.locator("main article")).toHaveCount(4);
    await page.setViewportSize({ width: 320, height: 931 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const url of ["/products?category=network", "/services#secure-systems"]) {
      await page.goto(url);
      for (const section of await reveals.all()) {
        await expect(section).toHaveAttribute("data-revealed", "true");
        await expect(section).toHaveCSS("filter", "blur(0px)");
        await expect(section).toHaveCSS("opacity", "1");
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
      await page.screenshot({ path: `test-results/${url.startsWith("/products") ? "products" : "services"}-reveal-${language}-320.png` });
    }
  });
}
