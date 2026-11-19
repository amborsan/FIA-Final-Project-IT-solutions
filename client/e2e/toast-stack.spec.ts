import { expect, test } from "@playwright/test";
import { translations } from "../src/i18n/translations";

for (const language of ["en", "de"] as const) {
  test(`${language}: cart feedback stacks, pauses, dismisses and survives navigation`, async ({ page }) => {
    const t = translations[language];
    await page.addInitScript(language => {
      localStorage.setItem("orbit_language", language);
      localStorage.setItem("orbit_cookie_consent", "true");
      localStorage.setItem("orbit_theme", language === "de" ? "dark" : "light");
    }, language);
    await page.emulateMedia({ reducedMotion: language === "de" ? "reduce" : "no-preference" });
    await page.setViewportSize({ width: language === "de" ? 320 : 1280, height: 931 });
    await page.goto("/products");
    const stack = page.getByRole("list", { name: t["feedback.notifications"], exact: true });
    const add = page.locator("main article button");
    await expect(add.first()).toBeVisible();
    for (let index = 0; index < 3; index++) await add.nth(index).click();
    const toasts = stack.getByRole("status");
    await expect(toasts).toHaveCount(3);
    for (const toast of await toasts.all()) {
      await expect(toast).toContainText(t["products.added"]);
      const box = await toast.boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(15);
      expect(box!.x + box!.width).toBeLessThanOrEqual(language === "de" ? 305 : 1265);
      const close = toast.getByRole("button", { name: t["feedback.dismiss"] });
      await expect(close).toHaveCSS("width", "44px");
    }
    await stack.hover();
    await page.waitForTimeout(6200);
    await expect(toasts).toHaveCount(3);
    await stack.getByRole("button", { name: t["feedback.dismiss"] }).first().focus();
    await expect(stack.getByRole("button", { name: t["feedback.dismiss"] }).first()).toBeFocused();
    await page.mouse.move(0, 0);
    await expect(stack.getByRole("button", { name: t["feedback.dismiss"] }).first()).toBeFocused();
    await page.waitForTimeout(6200);
    await expect(toasts).toHaveCount(3);
    await stack.getByRole("button", { name: t["feedback.dismiss"] }).first().press("Enter");
    await expect(toasts).toHaveCount(2);
    // Real client-side navigation: no full reload, and no order is submitted.
    await page.locator('header a[href="/cart"]').click();
    await expect(page).toHaveURL(/\/cart$/);
    await expect(toasts).toHaveCount(2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(language === "de" ? 320 : 1280);
    await page.screenshot({ path: `test-results/toast-stack-${language}.png` });
    await page.mouse.move(0, 0);
    await expect(toasts).toHaveCount(0, { timeout: 8000 });
  });
}
