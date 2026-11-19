import { expect, test } from "@playwright/test";
import { translations } from "../src/i18n/translations";

for (const language of ["en", "de"] as const) {
  test(`${language}: service cards open a centered accessible preview`, async ({ page }) => {
    const t = translations[language];
    await page.addInitScript(language => {
      localStorage.setItem("orbit_language", language);
      localStorage.setItem("orbit_cookie_consent", "true");
      localStorage.setItem("orbit_theme", "light");
    }, language);
    await page.setViewportSize({ width: 1241, height: 931 });
    await page.goto("/services");
    const cards = page.locator('main button[aria-haspopup="dialog"]');
    await expect(cards).toHaveCount(10);
    const trigger = cards.first();
    const name = await trigger.getAttribute("aria-label");
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: name!, exact: true });
    await expect(dialog).toBeVisible();
    await expect(page).toHaveURL(/\/services$/);
    const close = dialog.getByRole("button", { name: t["common.close"], exact: true });
    await expect(close).toBeFocused();
    await expect(dialog.locator("li")).toHaveCount(4);
    await expect(dialog.getByRole("link", { name: t["nav.quote"] })).toHaveAttribute("href", /\/quote\?service=/);
    await expect(dialog.getByRole("link", { name: t["services.viewFullDetails"] })).toHaveAttribute("href", /\/services\//);
    await expect.poll(() => dialog.evaluate(el => getComputedStyle(el).clipPath)).toMatch(/^inset\(0/);
    await page.screenshot({ path: `test-results/service-modal-${language}-desktop.png` });
    await close.press("Shift+Tab");
    await expect(dialog.getByRole("link", { name: t["services.viewFullDetails"] })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await trigger.click();
    await page.locator('[data-slot="center-morph-backdrop"]').click({ position: { x: 4, y: 4 } });
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 320, height: 500 });
    await trigger.click();
    await expect(dialog).toBeVisible();
    const bounds = await dialog.boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(15);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(305);
    expect(bounds!.height).toBeLessThanOrEqual(469);
    expect(await dialog.evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    await page.screenshot({ path: `test-results/service-modal-${language}-320.png` });
    await dialog.getByRole("link", { name: t["services.viewFullDetails"] }).click();
    await expect(page).toHaveURL(/\/services\/.+/);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    const related = page.getByRole("region", { name: t["services.related"] });
    await related.locator('button[aria-haspopup="dialog"]').first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("dialog").getByRole("link", { name: t["nav.quote"] }).click();
    await expect(page).toHaveURL(/\/quote\?service=/);
  });
}
