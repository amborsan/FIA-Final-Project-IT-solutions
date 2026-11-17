import { test, expect } from "@playwright/test";
import { translations } from "../src/i18n/translations";

const roles = [
  { role: "admin", email: "admin@orbit-it.de", password: "Admin12345!", root: "/admin", next: "/admin/requests" },
  { role: "technician", email: "tech@orbit-it.de", password: "Tech12345!", root: "/technician", next: "/technician/tasks" },
  { role: "customer", email: "customer@orbit-it.de", password: "Customer12345!", root: "/portal", next: "/portal/requests" },
] as const;

for (const account of roles) for (const language of ["en", "de"] as const) {
  test(`${account.role} ${language}: animated sidebar, keyboard and mobile dialog`, async ({ page }) => {
    test.setTimeout(45000);
    await page.emulateMedia({ reducedMotion: language === "de" ? "reduce" : "no-preference" });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.addInitScript(() => {
      localStorage.setItem("orbit_language", "en");
      localStorage.setItem("orbit_theme", "light");
      localStorage.setItem("orbit_cookie_consent", "true");
    });
    await page.goto("/login");
    await page.getByLabel("Email address", { exact: true }).fill(account.email);
    await page.getByLabel("Password", { exact: true }).fill(account.password);
    await page.locator("form").getByRole("button", { name: "Log in", exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${account.root}/?$`), { timeout: 15000 });
    if (language === "de") await page.getByRole("button", { name: "DE", exact: true }).click();
    const t = translations[language];
    const toggle = page.getByRole("button", { name: t["sidebar.toggle"], exact: true });
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    const sidebar = page.locator('aside[data-slot="sidebar"]');
    await expect(sidebar.locator('a[aria-current="page"]')).toHaveAttribute("href", account.root);
    await page.screenshot({ path: `test-results/sidebar-${account.role}-${language}-desktop.png` });
    await toggle.focus();
    await page.keyboard.press("Enter");
    await expect(sidebar).toHaveAttribute("data-state", "collapsed");
    await expect.poll(() => sidebar.evaluate(el => el.getBoundingClientRect().width)).toBeLessThan(73);
    const link = sidebar.locator(`a[href="${account.next}"]`);
    await expect(link).toHaveAttribute("aria-label", /.+/);
    await page.screenshot({ path: `test-results/sidebar-${account.role}-${language}-collapsed.png` });
    const destinationTitle = account.role === "technician" ? t["technician.assignedRequests"] : account.role === "customer" ? t["requests.title"] : t["admin.requests"];
    // Deliver the real lazy page module only after the URL changes. This keeps
    // the cold-navigation regression reproducible without API mocks or sleeps.
    const delayedModule = account.role === "technician" ? "/src/routes/technician.tasks.tsx" : "/src/routes/portal.requests.index.tsx";
    let releaseModule: () => void = () => {};
    const moduleReady = new Promise<void>(resolve => { releaseModule = resolve; });
    if (account.role !== "admin" && language === "en") {
      await page.route(url => url.pathname === delayedModule && url.searchParams.has("tsr-split"), async route => {
        await moduleReady;
        await route.continue();
      });
    }
    try {
      await link.focus();
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(new RegExp(`${account.next}/?$`));
      if (account.role !== "admin" && language === "en") {
        await expect(page.getByRole("heading", { level: 1, name: destinationTitle, exact: true })).not.toBeVisible();
      }
    } finally {
      releaseModule();
    }
    // URL updates before the destination shell mounts; do not interact with
    // the outgoing sidebar whose controls will be removed by navigation.
    await expect(page.getByRole("heading", { level: 1, name: destinationTitle, exact: true })).toBeVisible();
    await expect(page.locator('aside[data-slot="sidebar"]')).toHaveAttribute("data-state", "collapsed");
    await page.setViewportSize({ width: 360, height: 800 });
    const mobileToggle = page.getByRole("button", { name: t["sidebar.toggle"], exact: true });
    await mobileToggle.click();
    const drawer = page.getByRole("dialog", { name: t["sidebar.label"], exact: true });
    await expect(drawer).toBeVisible();
    await expect.poll(() => drawer.evaluate(el => el.contains(document.activeElement))).toBe(true);
    await expect(drawer.locator('a[aria-current="page"]')).toHaveAttribute("href", account.next);
    await page.screenshot({ path: `test-results/sidebar-${account.role}-${language}-mobile.png` });
    await page.keyboard.press("Escape");
    await expect(drawer).not.toBeVisible();
    await expect(mobileToggle).toBeFocused();
    await mobileToggle.click();
    await drawer.locator(`a[href="${account.root}"]`).click();
    await expect(page).toHaveURL(new RegExp(`${account.root}/?$`));
    await expect(page.getByRole("dialog")).not.toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  });
}
