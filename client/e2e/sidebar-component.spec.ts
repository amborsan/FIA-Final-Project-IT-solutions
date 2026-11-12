import { test, expect } from "@playwright/test";
import { translations } from "../src/i18n/translations";

for (const role of ["admin", "technician", "customer"] as const) for (const language of ["en", "de"] as const) {
  test(`${role} ${language}: isolated sidebar interaction without API`, async ({ page }) => {
    const t = translations[language];
    await page.emulateMedia({ reducedMotion: language === "de" ? "reduce" : "no-preference" });
    await page.addInitScript(language => {
      localStorage.setItem("orbit_language", language);
    }, language);
    const apiRequests: string[] = [];
    page.on("request", request => { if (request.url().includes("/api/")) apiRequests.push(request.url()); });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`/e2e/fixtures/sidebar.html?role=${role}`);
    await page.locator("html").evaluate((el, theme) => el.setAttribute("data-theme", theme), language === "de" ? "orbit-dark" : "orbit");
    const sidebar = page.locator("aside[data-slot=sidebar]");
    await expect(sidebar).toBeVisible();
    const toggle = page.getByRole("button", { name: t["sidebar.toggle"], exact: true });
    await toggle.click();
    await expect.poll(() => sidebar.evaluate(el => el.getBoundingClientRect().width)).toBeLessThan(73);
    await expect(sidebar.locator('a[aria-current="page"]')).toHaveAttribute("aria-label", /.+/);
    expect(await sidebar.locator('a').first().evaluate(el => el.getBoundingClientRect().height)).toBeLessThan(80);
    await page.screenshot({ path: `test-results/sidebar-confirm-${role}-${language}-desktop.png` });
    const input = page.locator("input");
    await input.focus();
    await page.keyboard.press("Control+b");
    await expect(sidebar).toHaveAttribute("data-state", "collapsed");
    await toggle.focus();
    await page.keyboard.press("Control+b");
    await expect(sidebar).toHaveAttribute("data-state", "expanded");
    await page.setViewportSize({ width: 360, height: 800 });
    const mobileToggle = page.getByRole("button", { name: t["sidebar.toggle"], exact: true });
    const drawer = page.getByRole("dialog", { name: t["sidebar.label"], exact: true });
    for (let i = 0; i < 5; i++) {
      await mobileToggle.click();
      await expect(drawer).toBeVisible();
      await expect.poll(() => drawer.evaluate(el => el.contains(document.activeElement))).toBe(true);
      await page.keyboard.press("Shift+Tab");
      // Native modal focus may move to browser chrome; outside page controls stay inert.
      await expect(page.getByTestId("outside")).not.toBeFocused();
      await expect.poll(() => drawer.evaluate(el => el.matches(":modal"))).toBe(true);
      await drawer.getByRole("button", { name: t["sidebar.close"], exact: true }).focus();
      await page.keyboard.press("Escape");
      await expect(drawer).not.toBeVisible();
      await expect(mobileToggle).toBeFocused();
    }
    await mobileToggle.click();
    await expect(drawer).toBeVisible();
    await page.screenshot({ path: `test-results/sidebar-confirm-${role}-${language}-mobile.png` });
    // Click the actual native backdrop, outside the panel bounds.
    await page.mouse.click(350, 300);
    await expect(drawer).not.toBeVisible();
    await expect(mobileToggle).toBeFocused();
    await mobileToggle.click();
    const next = role === "technician" ? "/technician/tasks" : role === "admin" ? "/admin/requests" : "/portal/requests";
    await drawer.locator(`a[href="${next}"]`).click();
    await expect(page.getByTestId("fixture-path")).toHaveText(next);
    await expect(drawer).not.toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
    expect(apiRequests).toEqual([]);
  });
}
