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
    const timeline = section.locator(".process-timeline-view");
    await expect(timeline.locator("ol > li")).toHaveCount(8);
    await expect(timeline.locator("h3")).toHaveText([t["home.processPhase1"], t["home.processPhase2"], t["home.processPhase3"]]);
    await expect(timeline.locator("h4")).toHaveText(Array.from({ length: 8 }, (_, i) => t[`home.step${i + 1}.title` as TranslationKey]));
    expect(await timeline.locator("ol").evaluateAll(lists => lists.map(list => list.getAttribute("start")))).toEqual(["1", "3", "6"]);
    for (const width of [1440, 768, 360, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await timeline.scrollIntoViewIfNeeded();
      await expect(timeline).toHaveAttribute("data-layout", width >= 1024 ? "carousel" : "vertical");
      const positions = await timeline.locator(width >= 1024 ? '[data-slot="timeline-event"]' : ".process-marker").evaluateAll(markers => markers.map(marker => {
        const r = marker.getBoundingClientRect();
        return { x: r.x, y: r.y };
      }));
      for (let i = 1; i < positions.length; i++) {
        if (width >= 1024) {
          expect(positions[i].x).toBeGreaterThan(positions[i - 1].x);

        } else {
          expect(positions[i].x).toBeCloseTo(positions[0].x, 0);
          expect(positions[i].y).toBeGreaterThan(positions[i - 1].y);
        }
      }
      for (let step = 1; step <= 8; step++) {
        await expect(timeline.getByText(t[`home.step${step}.text` as TranslationKey], { exact: true })).toBeVisible();
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      if (width < 1024) await expect(timeline.locator(".process-marker i").first()).toHaveCSS("animation-name", "none");
      if (width === 1440 || width === 360) await section.screenshot({ path: `test-results/process-timeline-${language}-${width}.png`, style: "header.site-header, header.site-header * { visibility: hidden !important; }" });
    }
    await page.locator("html").evaluate(el => el.setAttribute("data-theme", "orbit-dark"));
    await section.screenshot({ path: `test-results/process-timeline-${language}-dark.png`, style: "header.site-header, header.site-header * { visibility: hidden !important; }" });
  });
}

test("desktop timeline supports keyboard, dragging, wheel and explicit phase controls", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => { localStorage.setItem("orbit_cookie_consent", "true"); localStorage.setItem("orbit_language", "en"); });
  await page.goto("/");
  const stage = page.getByRole("region", { name: translations.en["home.processTimeline"], exact: true });
  const active = stage.locator('button[aria-current="step"]');
  await stage.scrollIntoViewIfNeeded();
  await expect(active).toHaveAccessibleName(/Quote and scheduling/);
  await active.focus();
  await page.keyboard.press("ArrowRight");
  await expect(active).toHaveAccessibleName(/Delivery and support/);
  await page.keyboard.press("Home");
  await expect(active).toHaveAccessibleName(/Your requirements/);
  await page.keyboard.press("End");
  await expect(active).toHaveAccessibleName(/Delivery and support/);
  await page.getByRole("button", { name: translations.en["home.processPrevious"], exact: true }).click();
  await expect(active).toHaveAccessibleName(/Quote and scheduling/);
  await stage.locator('[data-slot="timeline-event"]').first().getByRole("button").click();
  await expect(active).toHaveAccessibleName(/Your requirements/);
  const bounds = await stage.boundingBox();
  await page.mouse.move(bounds!.x + bounds!.width / 2, bounds!.y + bounds!.height / 2);
  await page.mouse.down();
  await page.mouse.move(bounds!.x + bounds!.width / 2 - 240, bounds!.y + bounds!.height / 2, { steps: 10 });
  await page.mouse.up();
  await expect(active).not.toHaveAccessibleName(/Your requirements/);
  await active.focus();
  await page.keyboard.press("Home");
  await expect(active).toHaveAccessibleName(/Your requirements/);
  await expect.poll(async () => {
    const card = await active.boundingBox();
    const box = await stage.boundingBox();
    return Math.abs(card!.x + card!.width / 2 - box!.x - box!.width / 2);
  }).toBeLessThan(1);
  await stage.dispatchEvent("wheel", { deltaX: 400, deltaY: 0 });
  await expect(active).toHaveAccessibleName(/Quote and scheduling/);
  await page.screenshot({ path: "test-results/process-timeline-interaction.png" });
});
