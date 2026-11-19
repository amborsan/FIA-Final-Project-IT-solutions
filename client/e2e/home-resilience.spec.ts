import { test, expect } from "@playwright/test";
import { translations } from "../src/i18n/translations";

for (const language of ["en", "de"] as const) {
  test(`${language}: navbar fits 320px and keeps its menu reachable`, async ({ page }) => {
    const t = translations[language];
    await page.addInitScript(language => {
      localStorage.setItem("orbit_language", language);
      localStorage.setItem("orbit_cookie_consent", "true");
    }, language);
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto("/");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    const menu = page.getByRole("button", { name: t["nav.menu"], exact: true });
    const bounds = await menu.boundingBox();
    const innerRight = await page.locator("header > .container-page").evaluate(el => el.getBoundingClientRect().right - parseFloat(getComputedStyle(el).paddingRight));
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(innerRight);
    await page.screenshot({ path: `test-results/home-navbar-${language}-320.png` });
    await menu.click();
    const dialog = page.getByRole("dialog", { name: t["nav.menu"], exact: true });
    const nav = dialog.getByRole("navigation", { name: t["nav.primary"], exact: true });
    await expect(nav.locator("summary").filter({ hasText: t["nav.services"] })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    await page.keyboard.press("Escape");
    await expect(menu).toBeFocused();
  });

  test(`${language}: home sections load, report failures and retry independently against the real API`, async ({ page }) => {
    const t = translations[language];
    await page.addInitScript(language => {
      localStorage.setItem("orbit_language", language);
      localStorage.setItem("orbit_cookie_consent", "true");
    }, language);
    let mode: "hold" | "fail" | "live" = "hold";
    let release!: () => void;
    const gate = new Promise<void>(resolve => { release = resolve; });
    await page.route("**/api/**", async route => {
      const url = new URL(route.request().url());
      const homeRequest = url.pathname === "/api/services" || url.pathname === "/api/content" || (url.pathname === "/api/products" && url.searchParams.get("featured") === "true");
      if (!homeRequest) return route.continue();
      if (mode === "hold") await gate;
      if (mode === "fail") return route.abort("failed");
      return route.continue();
    });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const sections = [
      page.getByRole("region", { name: t["home.servicesTitle"], exact: true }),
      page.getByRole("region", { name: t["home.productsTitle"], exact: true }),
      page.getByRole("region", { name: t["home.blogTitle"], exact: true }),
    ];
    try {
      for (const section of sections) await expect(section.getByRole("status")).toBeVisible();
    } finally {
      mode = "fail";
      release();
    }
    for (const section of sections) await expect(section.getByRole("alert")).toBeVisible({ timeout: 20000 });
    await sections[0].screenshot({ path: `test-results/home-services-error-${language}.png` });
    mode = "live";
    await sections[0].getByRole("button", { name: t["common.retry"], exact: true }).click();
    await expect(sections[0].locator('a[href^="/services/"]').first()).toBeVisible();
    await expect(sections[1].getByRole("alert")).toBeVisible();
    for (const section of sections.slice(1)) await section.getByRole("button", { name: t["common.retry"], exact: true }).click();
    await expect(sections[1].locator('a[href^="/products/"]').first()).toBeVisible();
    await expect(sections[2].locator('a[href^="/blog/"]').first()).toBeVisible();
    for (const section of sections) await expect(section.getByRole("alert")).toHaveCount(0);
  });
}
