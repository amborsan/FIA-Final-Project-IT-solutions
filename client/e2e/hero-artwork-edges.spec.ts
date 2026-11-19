import { expect, test } from "@playwright/test";

for (const language of ["en", "de"] as const) {
  test(`${language}: hands retain their lower edge and responsive hero spacing`, async ({ page }) => {
    await page.addInitScript(language => {
      localStorage.setItem("orbit_language", language);
      localStorage.setItem("orbit_cookie_consent", "true");
      localStorage.setItem("orbit_theme", "dark");
    }, language);
    await page.goto("/");
    await expect(page.locator(".hero-particle-hands")).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    const checkLayout = async (width: number, height: number) => {
      await page.setViewportSize({ width, height });
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      if (width >= 768) await expect.poll(() => page.evaluate(() => {
        const stats = document.querySelector(".home-hero-stats")!.getBoundingClientRect();
        return stats.bottom;
      })).toBeLessThanOrEqual(height);
      const layout = await page.evaluate(() => {
        const canvas = document.querySelector(".hero-particle-hands")!;
        const art = document.querySelector(".home-hero-artwork")!.getBoundingClientRect();
        const bounds = canvas.getBoundingClientRect();
        const style = getComputedStyle(canvas);
        return { mask: style.maskImage, offset: parseFloat(style.top), top: bounds.top - art.top,
          width: document.documentElement.scrollWidth,
          stats: Array.from(document.querySelectorAll(".home-hero-stats > div")).map(el => {
            const r = el.getBoundingClientRect();
            return { top: r.top, bottom: r.bottom, left: r.left, right: r.right };
          }) };
      });
      expect(layout.mask).toMatch(/linear-gradient.*rgba\(0, 0, 0, 0\) 0px.*rgb\(0, 0, 0\) 24px/);
      expect(layout.mask).not.toContain("100%");
      expect(layout.top).toBeCloseTo(layout.offset, 0);
      expect(layout.width).toBeLessThanOrEqual(width);
      expect(layout.stats).toHaveLength(4);
      for (const stat of layout.stats) {
        expect(stat.top).toBeGreaterThan(0);
        if (width >= 768) expect(stat.bottom).toBeLessThanOrEqual(height);
        expect(stat.left).toBeGreaterThanOrEqual(0);
        expect(stat.right).toBeLessThanOrEqual(width);
      }
    };
    for (const [width, height] of [[320, 800], [360, 800], [390, 844], [711, 931], [768, 800], [820, 1180], [1024, 768], [1440, 900], [1920, 1080]]) {
      await checkLayout(width, height);
      const topics = page.locator(".home-hero-topic");
      const boxes = await topics.evaluateAll(items => items.map(item => {
        const box = item.getBoundingClientRect();
        return { top: box.top, bottom: box.bottom, left: box.left, height: box.height };
      }));
      if (width < 768) {
        expect(boxes[1].top).toBeGreaterThanOrEqual(boxes[0].bottom);
        expect(boxes[2].top).toBeGreaterThanOrEqual(boxes[1].bottom);
        expect(boxes[1].left).toBeCloseTo(boxes[0].left, 0);
        boxes.forEach(box => expect(box.height).toBeGreaterThanOrEqual(48));
        await expect(topics.first()).toHaveCSS("justify-content", "center");
        await expect(page.locator(".home-hero-stats")).toHaveCSS("text-align", "center");
        const spacing = await page.evaluate(() => ({
          services: document.querySelector(".home-hero-topics")!.getBoundingClientRect().top - document.querySelector(".home-hero-artwork")!.getBoundingClientRect().bottom,
          stats: document.querySelector(".home-hero-stats")!.getBoundingClientRect().top - document.querySelector(".home-hero-topics")!.getBoundingClientRect().bottom,
        }));
        expect(spacing.services).toBeGreaterThanOrEqual(48);
        expect(spacing.stats).toBeGreaterThanOrEqual(48);
      } else {
        expect(boxes[1].top).toBeCloseTo(boxes[0].top, 0);
      }
    }
    // Inspect the dispersed phase with the real animation clock, without changing its timing.
    await page.waitForTimeout(11000);
    for (const [width, height] of [[390, 844], [768, 800], [1440, 900]]) {
      await checkLayout(width, height);
      await page.screenshot({ path: `test-results/hero-edges-${language}-${width}-burst.png` });
      if (width === 390) await page.screenshot({ path: `test-results/hero-mobile-spacing-${language}.png`, fullPage: true });
    }
    await page.waitForTimeout(6000);
    await checkLayout(768, 800);
    await page.screenshot({ path: `test-results/hero-edges-${language}-768-return.png` });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await checkLayout(320, 800);
  });
}
