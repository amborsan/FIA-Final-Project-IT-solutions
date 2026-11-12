import { test, expect } from "@playwright/test";
import { translations } from "../src/i18n/translations";

// Capture settled UI while retaining reduced-motion coverage.
test.use({ reducedMotion: "reduce" });

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "orbit_cookie_consent",
      JSON.stringify({
        essential: true,
        analytics: false,
        date: new Date().toISOString(),
      }),
    );
    if (!localStorage.getItem("orbit_language"))
      localStorage.setItem("orbit_language", "en");
    if (!localStorage.getItem("orbit_theme"))
      localStorage.setItem("orbit_theme", "light");
  });
});
for (const language of ["en", "de"] as const) {
  test(`${language}: mobile navigation, native forms and theme persistence`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("/login");
    await expect(
      page.getByRole("heading", { name: translations.en["auth.loginTitle"] }),
    ).toBeVisible();
    if (language === "de") {
      await page
        .getByRole("button", { name: translations.en["nav.menu"], exact: true })
        .click();
      await page
        .getByRole("button", { name: "DE", exact: true })
        .filter({ visible: true })
        .click();
      await page
        .getByRole("button", { name: translations.de["nav.menu"], exact: true })
        .click();
    }
    const t = translations[language];
    await expect(
      page.getByRole("heading", { name: t["auth.loginTitle"] }),
    ).toBeVisible();
    await page.getByRole("button", { name: t["theme.switchToDark"] }).click();
    await expect(page.locator("html")).toHaveAttribute(
      "data-theme",
      "orbit-dark",
    );
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute(
      "data-theme",
      "orbit-dark",
    );
    // HTML validation stops an empty form before any login request.
    let submits = 0;
    page.on("request", (r) => {
      if (r.url().endsWith("/auth/login") && r.method() === "POST") submits++;
    });
    await page
      .locator("form")
      .getByRole("button", { name: t["auth.loginButton"], exact: true })
      .click();
    expect(submits).toBe(0);
    for (const route of [
      "/",
      "/login",
      "/products",
      "/services",
      "/quote",
      "/contact",
      "/cart",
      "/legal/cookies",
    ]) {
      await page.goto(route);
      await expect(page.locator("header")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
    await page.goto("/");
    await page.screenshot({
      path: `test-results/migration-mobile-${language}.png`,
      fullPage: true,
    });
  });
}
test("desktop controls retain the current theme tokens and dimensions", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/login");
  const input = page.locator('form [data-slot="input"]').first();
  await expect(input).toBeVisible();
  expect(await input.evaluate((el) => getComputedStyle(el).height)).toBe(
    "48px",
  );
  expect(await input.evaluate((el) => getComputedStyle(el).borderRadius)).toBe(
    "8px",
  );
  await page.goto("/contact");
  const textarea = page.locator('[data-slot="textarea"]').first();
  await expect(textarea).toBeVisible();
  const initialHeight = await textarea.evaluate((el) => el.clientHeight);
  await textarea.fill("Long draft ".repeat(360));
  expect(await textarea.evaluate((el) => el.clientHeight)).toBe(initialHeight);
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();
  await page.screenshot({
    path: "test-results/migration-desktop-light.png",
    fullPage: false,
  });
});
test("demo customer session opens portal and account menu closes with Escape", async ({
  page,
}) => {
  page.on("requestfailed", (r) =>
    console.log("Failed request", r.url(), r.failure()?.errorText),
  );
  page.on("response", (r) => {
    if (r.url().includes("/api/auth/") && r.status() >= 400)
      console.log("Auth response", r.status(), r.url());
  });
  await page.goto("/login");
  await page
    .getByRole("button")
    .filter({ hasText: "customer@fia-it.de" })
    .click();
  await page
    .locator("form")
    .getByRole("button", { name: "Log in", exact: true })
    .click();
  await expect(page).toHaveURL(/\/portal\/?$/, { timeout: 15000 });
  const trigger = page.locator('header [data-slot="dropdown-menu-trigger"]');
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("menu")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).not.toBeVisible();
  await expect(trigger).toBeFocused();
});
