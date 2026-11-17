import { expect, test } from "@playwright/test";
import { translations } from "../src/i18n/translations";

for (const language of ["en", "de"] as const) {
  test(`${language}: circle blur theme switch persists and respects reduced motion`, async ({ page }) => {
    const t = translations[language];
    await page.addInitScript(language => {
      localStorage.setItem("orbit_language", language);
      if (!localStorage.getItem("orbit_theme")) localStorage.setItem("orbit_theme", "light");
      localStorage.setItem("orbit_cookie_consent", "true");
    }, language);
    await page.goto("/");
    const root = page.locator("html");
    const toggle = page.getByRole("button", { name: t["theme.switchToDark"], exact: true });
    await toggle.click();
    await expect(root).toHaveAttribute("data-beui-vt", "circle-blur");
    await expect(root).toHaveAttribute("data-theme", "orbit-dark");
    await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement, "::view-transition-new(root)").animationName)).toBe("beui-circle-blur-reveal");
    await page.evaluate(() => {
      for (const animation of document.getAnimations()) {
        if (animation instanceof CSSAnimation && animation.animationName === "beui-circle-blur-reveal") {
          animation.pause();
          animation.currentTime = 350;
        }
      }
    });
    await page.screenshot({ path: `test-results/theme-toggle-${language}-circle-blur.png` });
    await page.evaluate(() => {
      for (const animation of document.getAnimations()) {
        if (animation instanceof CSSAnimation && animation.animationName === "beui-circle-blur-reveal") animation.play();
      }
    });
    await expect(root).not.toHaveAttribute("data-beui-vt");
    expect(await page.evaluate(() => localStorage.getItem("orbit_theme"))).toBe("dark");
    await page.reload();
    await expect(root).toHaveAttribute("data-theme", "orbit-dark");
    const light = page.getByRole("button", { name: t["theme.switchToLight"], exact: true });
    await light.focus();
    await page.keyboard.press("Enter");
    await expect(root).toHaveAttribute("data-theme", "orbit");
    await expect(root).not.toHaveAttribute("data-beui-vt");
    await expect(page.getByRole("button", { name: t["theme.switchToDark"], exact: true })).toBeFocused();
    await page.setViewportSize({ width: 360, height: 931 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.getByRole("button", { name: t["theme.switchToDark"], exact: true }).click();
    await expect(root).toHaveAttribute("data-theme", "orbit-dark");
    await expect(root).not.toHaveAttribute("data-beui-vt");
    await page.screenshot({ path: `test-results/theme-toggle-${language}-mobile.png` });
    // Older browsers still change theme without depending on view transitions.
    await page.evaluate(() => Object.defineProperty(document, "startViewTransition", { value: undefined, configurable: true }));
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.getByRole("button", { name: t["theme.switchToLight"], exact: true }).click();
    await expect(root).toHaveAttribute("data-theme", "orbit");
    await expect(root).not.toHaveAttribute("data-beui-vt");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  });
}
