import { expect, test } from "@playwright/test";

test("language pill follows keyboard selection and remains aligned after resizing", async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem("orbit_language")) localStorage.setItem("orbit_language", "en");
    localStorage.setItem("orbit_cookie_consent", "true");
  });
  await page.setViewportSize({ width: 1156, height: 931 });
  await page.goto("/services");
  const header = page.locator("header.site-header");
  const en = header.getByRole("button", { name: "EN", exact: true });
  const de = header.getByRole("button", { name: "DE", exact: true });
  const aligned = async () => {
    await expect.poll(async () => {
      const pill = await header.locator("[data-language-indicator]").boundingBox();
      const selected = await header.locator('[aria-pressed="true"][data-language]').boundingBox();
      return Math.abs(pill!.x - selected!.x) + Math.abs(pill!.width - selected!.width);
    }).toBeLessThan(1);
  };
  await en.focus();
  await en.press("ArrowRight");
  await expect(de).toBeFocused();
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
  await aligned();
  await de.press("Home");
  await expect(en).toBeFocused();
  await en.press("End");
  await expect(de).toBeFocused();
  await aligned();
  await page.screenshot({ path: "test-results/language-tabs-desktop.png" });
  await page.reload();
  await expect(de).toHaveAttribute("aria-pressed", "true");
  await page.setViewportSize({ width: 320, height: 931 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 768, height: 931 });
  await expect(de).toBeVisible();
  await en.click();
  await aligned();
  await expect(en.locator("[data-language-label]")).not.toHaveCSS("clip-path", "inset(0px 100% 0px 0px)");
});
