import { expect, test } from "@playwright/test";

for (const language of ["en", "de"] as const) {
  test(`${language}: home sections blur in once without changing layout or native scrolling`, async ({ page }) => {
    await page.addInitScript(language => {
      localStorage.setItem("orbit_language", language);
      localStorage.setItem("orbit_cookie_consent", "true");
      localStorage.setItem("orbit_theme", "light");
    }, language);
    await page.setViewportSize({ width: 1280, height: 931 });
    await page.goto("/");
    const sections = page.locator('main [data-slot="scroll-reveal"]');
    await expect(sections).toHaveCount(5);
    const last = sections.last();
    await expect(last).toHaveAttribute("data-revealed", "false");
    await expect(last).toHaveCSS("filter", "blur(8px)");
    for (const section of await sections.all()) {
      await section.scrollIntoViewIfNeeded();
      await expect(section).toHaveAttribute("data-revealed", "true");
      await expect(section).toHaveCSS("filter", "blur(0px)");
      await expect(section).toHaveCSS("opacity", "1");
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(last).toHaveAttribute("data-revealed", "true");
    await expect(last).toHaveCSS("filter", "blur(0px)");
    await sections.first().scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/home-reveal-${language}-desktop.png` });
    await page.setViewportSize({ width: 320, height: 931 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    await expect(sections).toHaveCount(5);
    for (const section of await sections.all()) {
      await expect(section).toHaveAttribute("data-revealed", "true");
      await expect(section).toHaveCSS("opacity", "1");
      await expect(section).toHaveCSS("filter", "blur(0px)");
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    await sections.first().scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/home-reveal-${language}-320.png` });
  });
}
