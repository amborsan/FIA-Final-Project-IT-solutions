import { test, expect, type Page } from "@playwright/test";
import { translations } from "../src/i18n/translations";

test.use({ reducedMotion: "reduce" });
async function signIn(page: Page) {
  await page.addInitScript(() => {
    if (!localStorage.getItem("orbit_language"))
      localStorage.setItem("orbit_language", "en");
    if (!localStorage.getItem("orbit_theme"))
      localStorage.setItem("orbit_theme", "light");
    localStorage.setItem("orbit_cookie_consent", "true");
  });
  await page.goto("/login");
  // README documents this demo account. Overrides allow team-managed test accounts.
  await page
    .getByLabel("Email address", { exact: true })
    .fill(process.env.E2E_ADMIN_EMAIL ?? "admin@orbit-it.de");
  await page
    .getByLabel("Password", { exact: true })
    .fill(process.env.E2E_ADMIN_PASSWORD ?? "Admin12345!");
  await page
    .locator("form")
    .getByRole("button", { name: "Log in", exact: true })
    .click();
  await expect(page).toHaveURL(/\/admin\/?$/, { timeout: 15000 });
  await expect(page.locator(".admin-dashboard aside")).toBeVisible();
}
async function visit(page: Page, route: string) {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.locator(".admin-dashboard aside")).toBeVisible();
  // Keep providers and query caches alive instead of reloading every screen.
  if (new URL(page.url()).pathname.replace(/\/$/, "") !== route) {
    const navigation = page.locator(
      `.admin-dashboard aside a[href="${route}"]`,
    );
    if (await navigation.count()) {
      await navigation.click();
    } else {
      await page
        .locator('.admin-dashboard aside a[href="/admin/requests"]')
        .click();
      await page
        .locator(`.admin-dashboard [data-slot=dashboard-content] a[href="${route}"]`)
        .first()
        .click();
    }
    await expect
      .poll(() => new URL(page.url()).pathname.replace(/\/$/, ""))
      .toBe(route);
  }
  await expect(page.locator(".admin-dashboard h1")).toBeVisible();
  await page
    .locator('.admin-dashboard [role="status"]')
    .waitFor({ state: "hidden" });
  await expect(page.locator('.admin-dashboard [role="alert"]')).toHaveCount(0);
  const dimensions = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    viewport: innerWidth,
  }));
  expect(
    dimensions.width,
    `${route} at ${dimensions.viewport}px`,
  ).toBeLessThanOrEqual(dimensions.viewport);
}
for (const language of ["en", "de"] as const) {
  test(`${language}: admin pages, read-only controls and responsive layouts`, async ({
    page,
  }) => {
    test.setTimeout(180000);
    await signIn(page);
    if (language === "de")
      await page.getByRole("button", { name: "DE", exact: true }).click();
    const t = translations[language];
    const writes: string[] = [];
    page.on("request", (request) => {
      if (
        request.url().includes("/api/") &&
        !["GET", "HEAD", "OPTIONS"].includes(request.method())
      )
        writes.push(`${request.method()} ${new URL(request.url()).pathname}`);
    });
    const routes = [
      "/admin",
      "/admin/requests",
      "/admin/orders",
      "/admin/tickets",
      "/admin/catalog",
      "/admin/content",
      "/admin/users",
      "/admin/messages",
      "/admin/inbox",
      "/admin/activity",
    ];
    await visit(page, "/admin/requests");
    const detail = await page
      .locator('.admin-dashboard a[href^="/admin/requests/"]')
      .first()
      .getAttribute("href");
    expect(detail).toBeTruthy();
    if (detail) routes.push(detail);
    for (const route of routes) {
      await visit(page, route);
      for (const theme of ["light", "dark"] as const) {
        const isDark =
          (await page.locator("html").getAttribute("data-theme")) ===
          "orbit-dark";
        if (isDark !== (theme === "dark")) {
          await page
            .getByRole("button", {
              name: t[
                theme === "dark" ? "theme.switchToDark" : "theme.switchToLight"
              ],
            })
            .click();
        }
        for (const width of [1440, 360]) {
          await page.setViewportSize({ width, height: 1000 });
          const dimensions = await page.evaluate(() => ({
            width: document.documentElement.scrollWidth,
            viewport: innerWidth,
          }));
          expect(
            dimensions.width,
            `${route}: ${language}, ${theme}, ${width}px`,
          ).toBeLessThanOrEqual(dimensions.viewport);
          if (route === "/admin")
            await page.screenshot({
              path: `test-results/admin-${language}-${theme}-${width}.png`,
              fullPage: false,
            });
        }
      }
    }
    // Exercise client-only searches, tabs, forms and conversation selection. Never save/send/assign/delete.
    await visit(page, "/admin/requests");
    await page
      .getByPlaceholder(t["list.searchRequests"])
      .fill("no-match-admin-review-923745");
    await expect(
      page.getByText(t["admin.noResults"], { exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: t["common.clear"], exact: true })
      .click();
    await expect(page.locator(".admin-dashboard table")).toBeVisible();
    await visit(page, "/admin/catalog");
    await page
      .getByRole("tab", { name: t["admin.products"], exact: true })
      .click();
    await expect(
      page.getByRole("tab", { name: t["admin.products"], exact: true }),
    ).toHaveAttribute("aria-selected", "true");
    await page
      .getByRole("button", { name: t["admin.addProduct"], exact: true })
      .click();
    await expect(page.locator(".admin-dashboard form")).toBeVisible();
    expect(
      await page.locator(".admin-dashboard form [required]").count(),
    ).toBeGreaterThan(0);
    await page.screenshot({
      path: `test-results/admin-product-form-${language}-360.png`,
      fullPage: false,
    });
    await visit(page, "/admin/content");
    await page
      .getByRole("button", { name: t["admin.newPage"], exact: true })
      .click();
    await expect(
      page.locator('.admin-dashboard [contenteditable="true"]'),
    ).toHaveCount(2);
    await visit(page, "/admin/tickets");
    await page
      .locator(".admin-dashboard [data-slot=dashboard-content] button.w-full.rounded-box")
      .first()
      .click();
    await expect(page.locator(".admin-dashboard form")).toBeVisible();
    await visit(page, "/admin/messages");
    await page
      .getByRole("button", { name: t["chat.newChat"], exact: true })
      .click();
    await expect(page.locator(".admin-dashboard form")).toBeVisible();
    const dimensions = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      viewport: innerWidth,
    }));
    expect(dimensions.width).toBeLessThanOrEqual(dimensions.viewport);
    expect(writes).toEqual([]);
  });
}
