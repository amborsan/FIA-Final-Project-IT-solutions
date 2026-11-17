import { test, expect } from "@playwright/test";
import { translations, type TranslationKey } from "../src/i18n/translations";

for (const language of ["en", "de"] as const) {
  test(`${language}: timeline retains all eight steps and adapts its reading direction`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(language => {
      localStorage.setItem("orbit_language", language);
      localStorage.setItem("orbit_theme", "light");
      localStorage.setItem("orbit_cookie_consent", "true");
    }, language);
    await page.goto("/");
    const t = translations[language];
    const section = page.getByRole("region", { name: t["home.processTitle"], exact: true });
    const timeline = section.locator(".process-timeline");
    await expect(timeline.locator("ol > li")).toHaveCount(8);
    await expect(timeline.locator("h3")).toHaveText([t["home.processPhase1"], t["home.processPhase2"], t["home.processPhase3"]]);
    await expect(timeline.locator("h4")).toHaveText(Array.from({ length: 8 }, (_, i) => t[`home.step${i + 1}.title` as TranslationKey]));
    expect(await timeline.locator("ol").evaluateAll(lists => lists.map(list => list.getAttribute("start")))).toEqual(["1", "3", "6"]);
    for (const width of [1440, 768, 360, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await timeline.scrollIntoViewIfNeeded();
      await expect(timeline).toHaveAttribute("data-entered", "true");
      const positions = await timeline.locator(".process-marker").evaluateAll(markers => markers.map(marker => {
        const r = marker.getBoundingClientRect();
        return { x: r.x, y: r.y };
      }));
      for (let i = 1; i < positions.length; i++) {
        if (width >= 1024) {
          expect(positions[i].x).toBeGreaterThan(positions[i - 1].x);
          expect(positions[i].y).toBeCloseTo(positions[0].y, 0);
        } else {
          expect(positions[i].x).toBeCloseTo(positions[0].x, 0);
          expect(positions[i].y).toBeGreaterThan(positions[i - 1].y);
        }
      }
      for (let step = 1; step <= 8; step++) {
        await expect(timeline.getByText(t[`home.step${step}.text` as TranslationKey], { exact: true })).toBeVisible();
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      await expect(timeline.locator(".process-marker i").first()).toHaveCSS("animation-name", "none");
      if (width === 1440 || width === 360) await section.screenshot({ path: `test-results/process-timeline-${language}-${width}.png`, style: "header.site-header, header.site-header * { visibility: hidden !important; }" });
    }
    await page.locator("html").evaluate(el => el.setAttribute("data-theme", "orbit-dark"));
    await section.screenshot({ path: `test-results/process-timeline-${language}-dark.png`, style: "header.site-header, header.site-header * { visibility: hidden !important; }" });
  });
}

test("timeline draws its rail once without hiding the process copy", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => localStorage.setItem("orbit_cookie_consent", "true"));
  await page.goto("/");
  const timeline = page.locator(".process-timeline");
  await timeline.evaluate(el => {
    let starts = 0;
    el.addEventListener("animationstart", () => el.setAttribute("data-animation-starts", String(++starts)));
  });
  await timeline.scrollIntoViewIfNeeded();
  await expect(timeline).toHaveAttribute("data-entered", "true");
  await expect.poll(() => timeline.locator(".process-phase").nth(1).evaluate(el => getComputedStyle(el, "::after").transform)).toBe("matrix(1, 0, 0, 1, 0, 0)");
  const starts = Number(await timeline.getAttribute("data-animation-starts"));
  expect(starts).toBeGreaterThan(0);
  await expect(timeline.locator("h4").first()).toHaveCSS("opacity", "1");
  await page.getByRole("heading", { level: 1 }).scrollIntoViewIfNeeded();
  await timeline.scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  expect(Number(await timeline.getAttribute("data-animation-starts"))).toBe(starts);
});
