import { expect, test } from "@playwright/test";
import { translations } from "../src/i18n/translations";

for (const language of ["en", "de"] as const) {
  test(`${language}: cascade retains button bounds and follows the real submission state`, async ({ page }) => {
    const t = translations[language];
    await page.addInitScript(language => {
      localStorage.setItem("orbit_language", language);
      localStorage.setItem("orbit_cookie_consent", "true");
      localStorage.setItem("orbit_theme", "light");
    }, language);
    await page.setViewportSize({ width: 1032, height: 931 });
    await page.goto("/products?category=network");
    const add = page.locator("main article").first().getByRole("button", { name: t["products.addToCart"], exact: true });
    await expect(add).toBeVisible();
    const width = (await add.boundingBox())!.width;
    await add.click();
    await expect(add.locator('[data-slot="action-swap-text"]')).toHaveAttribute("data-state", "added");
    await expect(add.locator("[data-action-letter]").first()).toBeAttached();
    expect((await add.boundingBox())!.width).toBeCloseTo(width, 0);
    await page.screenshot({ path: `test-results/action-cascade-${language}.png` });

    await page.goto("/quote");
    await page.setViewportSize({ width: 320, height: 931 });
    await page.locator('[name="contactName"]').fill("Jamie Example");
    await page.locator('[name="contactEmail"]').fill("jamie@example.com");
    await page.locator('[name="title"]').fill("Office network");
    await page.locator('textarea[name="description"]').fill("Please review our office network connection.");
    await page.getByRole("checkbox").first().check();
    let release: () => void = () => {};
    const held = new Promise<void>(resolve => { release = resolve; });
    let posts = 0;
    await page.route("**/api/requests/public", async route => {
      posts += 1;
      await held;
      await route.abort("failed");
    });
    const submit = page.getByRole("button", { name: t["quote.submit"], exact: true });
    await submit.click();
    await expect(submit).toBeDisabled();
    await expect(submit.locator('[data-slot="action-swap-text"]')).toHaveAttribute("data-state", "processing");
    await expect.poll(() => posts).toBe(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    release();
    await expect(submit).toBeEnabled();
    await expect(submit.locator('[data-slot="action-swap-text"]')).toHaveAttribute("data-state", "idle");
    const stack = page.getByRole("list", { name: t["feedback.notifications"], exact: true });
    await expect(stack.getByRole("alert")).toBeVisible();
    await expect(page.locator('[name="title"]')).toHaveValue("Office network");
    await page.screenshot({ path: `test-results/action-submit-${language}-320.png` });
    await stack.getByRole("alert").getByRole("button", { name: t["feedback.dismiss"] }).click();
    await expect(stack.getByRole("alert")).toHaveCount(0);
    expect(posts).toBe(1);
  });
}
