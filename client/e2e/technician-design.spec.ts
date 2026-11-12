import { test, expect, type Page } from "@playwright/test";
import { translations, type Language } from "../src/i18n/translations";

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
  await page
    .getByLabel("Email address", { exact: true })
    .fill(process.env.E2E_TECH_EMAIL ?? "tech@orbit-it.de");
  await page
    .getByLabel("Password", { exact: true })
    .fill(process.env.E2E_TECH_PASSWORD ?? "Tech12345!");
  await page
    .locator("form")
    .getByRole("button", { name: "Log in", exact: true })
    .click();
  await expect(page).toHaveURL(/\/technician\/?$/, { timeout: 15000 });
  await expect(page.locator(".technician-dashboard aside")).toBeVisible();
}
async function visit(page: Page, route: string, language: Language) {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const t = translations[language];
  if (new URL(page.url()).pathname.replace(/\/$/, "") !== route) {
    if (route === "/account") {
      await page.locator('header [data-slot="dropdown-menu-trigger"]').click();
      await page
        .getByRole("menuitem", { name: t["nav.account"], exact: true })
        .click();
    } else {
      if (!(await page.locator(".technician-dashboard aside").count())) {
        await page
          .locator('header [data-slot="dropdown-menu-trigger"]')
          .click();
        await page
          .getByRole("menuitem", { name: t["portal.dashboard"], exact: true })
          .click();
        await expect(page.locator(".technician-dashboard aside")).toBeVisible();
      }
      const link = page.locator(
        `.technician-dashboard aside a[href="${route}"]`,
      );
      if (await link.count()) await link.click();
      else {
        await page
          .locator('.technician-dashboard aside a[href="/technician/tickets"]')
          .click();
        await page
          .locator(`.technician-dashboard [data-slot=dashboard-content] a[href="${route}"]`)
          .first()
          .click();
      }
    }
    await expect
      .poll(() => new URL(page.url()).pathname.replace(/\/$/, ""))
      .toBe(route);
  }
  await expect(page.locator(".technician-dashboard h1")).toBeVisible();
  await page
    .locator('.technician-dashboard [role="status"]')
    .waitFor({ state: "hidden" });
  await expect(
    page.locator('.technician-dashboard [role="alert"]'),
  ).toHaveCount(0);
}
async function fits(page: Page, context: string) {
  const size = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    viewport: innerWidth,
  }));
  expect(size.width, context).toBeLessThanOrEqual(size.viewport);
}
for (const language of ["en", "de"] as const) {
  test(`${language}: technician pages, report draft and read-only controls`, async ({
    page,
  }) => {
    test.setTimeout(180000);
    await signIn(page);
    if (language === "de")
      await page.getByRole("button", { name: "DE", exact: true }).click();
    const t = translations[language],
      writes: string[] = [];
    page.on("request", (request) => {
      if (
        request.url().includes("/api/") &&
        !["GET", "HEAD", "OPTIONS"].includes(request.method())
      )
        writes.push(`${request.method()} ${new URL(request.url()).pathname}`);
    });
    const routes = [
      "/technician",
      "/technician/tasks",
      "/technician/tickets",
      "/technician/appointments",
      "/technician/reports",
      "/messages",
      "/account",
    ];
    await visit(page, "/technician/tickets", language);
    const detail = await page
      .locator('.technician-dashboard a[href^="/technician/tickets/"]')
      .first()
      .getAttribute("href");
    expect(detail).toBeTruthy();
    if (detail) routes.splice(3, 0, detail);
    for (const route of routes) {
      await visit(page, route, language);
      for (const theme of ["light", "dark"] as const) {
        const isDark =
          (await page.locator("html").getAttribute("data-theme")) ===
          "orbit-dark";
        if (isDark !== (theme === "dark"))
          await page
            .getByRole("button", {
              name: t[
                theme === "dark" ? "theme.switchToDark" : "theme.switchToLight"
              ],
            })
            .click();
        for (const width of [1440, 360]) {
          await page.setViewportSize({ width, height: 1000 });
          await fits(page, `${route}: ${language}, ${theme}, ${width}px`);
          if (route === "/technician")
            await page.screenshot({
              path: `test-results/technician-${language}-${theme}-${width}.png`,
              fullPage: false,
            });
        }
      }
    }
    await visit(page, "/technician/tasks", language);
    const search = page.getByPlaceholder(t["list.searchRequests"]);
    await search.fill("no-matching-task-review-984726");
    await expect(
      page.getByText(t["technician.noTasks"], { exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: t["common.clear"], exact: true })
      .click();
    const addReport = page
      .locator(
        '.technician-dashboard [data-slot=dashboard-content] a[href^="/technician/reports?request="]',
      )
      .first();
    const href = await addReport.getAttribute("href");
    expect(href).toBeTruthy();
    await addReport.click();
    await expect(page.locator(".technician-dashboard form")).toBeVisible();
    const requestId = new URL(page.url()).searchParams.get("request");
    await expect(
      page.getByRole("combobox", { name: t["technician.chooseTask"], exact: true }),
    ).toHaveValue(requestId!);
    // Exercise native validation and local file selection without submitting anything.
    await expect(
      page.getByLabel(t["technician.reportTitle"], { exact: true }),
    ).toHaveAttribute("required", "");
    await page
      .locator('.technician-dashboard input[type="file"]')
      .setInputFiles({
        name: "local-report-check.png",
        mimeType: "image/png",
        buffer: Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a4V0AAAAASUVORK5CYII=",
          "base64",
        ),
      });
    await page.setViewportSize({ width: 360, height: 1000 });
    await fits(page, `${language}: report form`);
    await page.screenshot({
      path: `test-results/technician-report-form-${language}-360.png`,
      fullPage: true,
    });
    await visit(page, "/messages", language);
    await page
      .getByRole("button", { name: t["chat.newChat"], exact: true })
      .click();
    await expect(page.locator(".technician-dashboard form")).toBeVisible();
    await page.setViewportSize({ width: 360, height: 1000 });
    await fits(page, `${language}: new conversation`);
    expect(writes).toEqual([]);
  });
}
