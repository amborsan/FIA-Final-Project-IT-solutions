import { expect, test } from "@playwright/test";
import { translations } from "../src/i18n/translations";

test.use({ reducedMotion: "reduce" });
for (const language of ["en", "de"] as const) {
  test(`${language}: cookie notice stays in flow and preserves essential-only acknowledgement`, async ({ page }) => {
    const t = translations[language];
    await page.addInitScript(language => {
      localStorage.setItem("orbit_language", language);
      localStorage.setItem("orbit_theme", "light");
    }, language);
    await page.goto("/");
    const notice = page.getByRole("region", { name: t["cookie.title"], exact: true });
    const details = notice.getByRole("button", { name: t["cookie.details"] });
    await expect(notice.getByRole("button")).toHaveCount(2);
    await expect(details).toHaveAttribute("aria-expanded", "false");
    for (const width of [1440, 360, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
      const geometry = await notice.evaluate(element => ({
        bottom: element.getBoundingClientRect().bottom,
        mainTop: document.querySelector("main")!.getBoundingClientRect().top,
        width: document.documentElement.scrollWidth,
      }));
      expect(geometry.width).toBeLessThanOrEqual(width);
      expect(geometry.bottom).toBeLessThanOrEqual(geometry.mainTop);
      const detailsBox = await details.boundingBox();
      const acknowledgeBox = await notice.getByRole("button", { name: t["cookie.acknowledge"] }).boundingBox();
      expect(detailsBox!.y).toBe(acknowledgeBox!.y);
      await page.screenshot({ path: `test-results/cookie-${language}-${width}-light.png` });
    }
    await details.focus();
    await page.keyboard.press("Enter");
    await expect(details).toHaveAttribute("aria-expanded", "true");
    await expect(notice).toContainText(t["cookie.essentialText"]);
    await expect(notice).toContainText(t["cookie.analyticsText"]);
    await expect(notice.getByRole("link")).toHaveAttribute("href", "/legal/privacy");
    await page.getByRole("button", { name: /Switch to dark mode|Zum dunklen Modus wechseln/ }).click();
    await page.screenshot({ path: `test-results/cookie-${language}-320-dark-details.png` });
    await notice.getByRole("button", { name: t["cookie.acknowledge"] }).click();
    await expect(notice).toHaveCount(0);
    const consent = await page.evaluate(() => JSON.parse(localStorage.getItem("orbit_cookie_consent")!));
    expect(consent).toEqual({ essential: true, analytics: false, date: expect.any(String) });
    await page.reload();
    await expect(notice).toHaveCount(0);
    const settings = page.getByRole("button", { name: t["legal.cookieSettings"], exact: true });
    await settings.click();
    await expect(notice.getByRole("heading")).toBeFocused();
    await expect(details).toHaveAttribute("aria-expanded", "true");
    await notice.getByRole("button", { name: t["cookie.acknowledge"] }).click();
    await expect(settings).toBeFocused();
  });
}
