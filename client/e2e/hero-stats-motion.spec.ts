import { test, expect } from "@playwright/test";

test("statistics decode once, preserve their size and respond to hover", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 400 });
  await page.addInitScript(() => localStorage.setItem("orbit_cookie_consent", "true"));
  await page.goto("/");
  const stats = page.locator(".home-hero-stats");
  const figures = stats.locator(".home-hero-stat-decoded");
  await expect(figures).toHaveCount(4);
  await expect(figures.first()).toHaveAttribute("data-state", "idle");
  const before = await stats.boundingBox();
  await stats.scrollIntoViewIfNeeded();
  await expect(figures.first()).toHaveAttribute("data-state", "decoding");
  await expect(figures.last()).toHaveAttribute("data-state", "settled");
  await expect(figures).toHaveText(["120+", "< 4 h", "40+", "98 %"]);
  const after = await stats.boundingBox();
  expect(after!.height).toBe(before!.height);
  expect(after!.width).toBe(before!.width);
  const first = stats.locator(":scope > div").first();
  await expect(stats.locator(".home-hero-topic-mark")).toHaveCount(0);
  await first.hover();
  await expect(first.locator(".home-hero-stat-value")).toHaveCSS("color", "rgb(245, 245, 245)");
  await expect(figures.first()).toHaveText("120+");
  await page.mouse.move(0, 0);
  await figures.first().evaluate(element => {
    element.setAttribute("data-replayed", "false");
    new MutationObserver(() => {
      if (element.getAttribute("data-state") === "decoding") element.setAttribute("data-replayed", "true");
    }).observe(element, { attributes: true, attributeFilter: ["data-state"] });
  });
  await page.getByRole("heading", { level: 1 }).scrollIntoViewIfNeeded();
  await stats.scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  await expect(figures.first()).toHaveAttribute("data-replayed", "false");
  await page.screenshot({ path: "test-results/hero-stats-decoded.png" });
});

test("reduced motion shows final statistics directly", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const figures = page.locator(".home-hero-stat-decoded");
  await figures.last().scrollIntoViewIfNeeded();
  await expect(figures.last()).toHaveAttribute("data-state", "settled");
  await expect(figures).toHaveText(["120+", "< 4 h", "40+", "98 %"]);
});
