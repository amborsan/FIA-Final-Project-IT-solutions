import { test, expect } from "@playwright/test";

test.use({ launchOptions: { args: ["--disable-webgl"] } });

test("without WebGL the static hero background and CTA remain usable", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("orbit_cookie_consent", "true"));
  await page.goto("/");
  await expect(page.locator(".home-hero")).toHaveCSS("background-image", /linear-gradient/);
  await expect(page.locator(".grainient-canvas")).toBeHidden();
  await expect(page.locator(".home-hero h1")).toBeVisible();
  await page.locator('.home-hero a[href="/quote"]').click();
  await expect(page).toHaveURL(/\/quote$/);
});
