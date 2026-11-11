import { test, expect } from "@playwright/test";
import { translations } from "../src/i18n/translations";

// Capture settled UI while retaining reduced-motion coverage.
test.use({ reducedMotion: "reduce" });

for (const language of ["en", "de"] as const) {
  test(`${language}: design system, local Geist, catalog search and local cart`, async ({
    page,
  }) => {
    await page.addInitScript((language) => {
      localStorage.setItem("orbit_language", language);
      if (!localStorage.getItem("orbit_theme"))
        localStorage.setItem("orbit_theme", "light");
      localStorage.setItem("orbit_cookie_consent", "true");
    }, language);
    const fontRequests: string[] = [];
    page.on("request", (request) => {
      if (request.resourceType() === "font") fontRequests.push(request.url());
    });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/products");
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(() => document.fonts.check('400 16px "Geist"')),
    ).toBe(true);
    expect(
      fontRequests.some((url) =>
        url.endsWith("/fonts/geist/Geist-Variable.woff2"),
      ),
    ).toBe(true);
    expect(
      fontRequests.every(
        (url) => new URL(url).origin === new URL(page.url()).origin,
      ),
    ).toBe(true);
    const t = translations[language];
    const search = page.getByPlaceholder(t["products.searchPlaceholder"]);
    await search.fill("no-match-for-catalog-783452");
    await expect(
      page.getByText(t["products.noProducts"], { exact: true }),
    ).toBeVisible();
    await search.clear();
    const add = page
      .locator("article button")
      .filter({ hasText: t["products.addToCart"] })
      .first();
    // Uses only the real catalog and browser-local cart; never submits an order.
    await expect(add).toBeVisible();
    await add.click();
    await expect(
      page.getByText(t["products.added"], { exact: true }),
    ).toBeVisible();
    await page.goto("/cart");
    await expect(
      page.getByText(t["cart.empty"], { exact: true }),
    ).not.toBeVisible();
    await page.goto("/products");
    await page.screenshot({
      path: `test-results/design-products-${language}.png`,
      fullPage: false,
    });
    for (const theme of ["light", "dark"] as const) {
      if (theme === "dark")
        await page
          .getByRole("button", { name: t["theme.switchToDark"] })
          .click();
      for (const width of [1440, 360]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto("/products");
        await expect(search).toBeVisible();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        await page.screenshot({
          path: `test-results/design-products-${language}-${theme}-${width}.png`,
          fullPage: false,
        });
      }
    }
  });
}
