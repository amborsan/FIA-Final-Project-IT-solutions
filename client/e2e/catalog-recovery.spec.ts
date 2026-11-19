import { expect, test } from "@playwright/test";
import { translations } from "../src/i18n/translations";

for (const language of ["en", "de"] as const) {
  test(`${language}: retrying the catalog also reloads failed category filters`, async ({ page }) => {
    await page.addInitScript(language => {
      localStorage.setItem("orbit_language", language);
      localStorage.setItem("orbit_cookie_consent", "true");
    }, language);
    await page.route(/\/api\/(products|categories)$/, route => route.abort());
    await page.goto("/products");

    const retry = page.getByRole("main").getByRole("button", {
      name: translations[language]["common.retry"],
    });
    await expect(retry).toBeVisible();

    await Promise.all([
      page.waitForRequest("**/api/products", { timeout: 5000 }),
      page.waitForRequest("**/api/categories", { timeout: 5000 }),
      retry.click(),
    ]);
  });
}
