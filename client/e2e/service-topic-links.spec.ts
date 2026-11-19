import { expect, test } from "@playwright/test";
import { translations } from "../src/i18n/translations";

for (const language of ["en", "de"] as const) {
  for (const device of ["desktop", "mobile"] as const) {
    test.describe(`${language}, ${device}`, () => {
      test.use({ reducedMotion: "reduce", hasTouch: device === "mobile", isMobile: device === "mobile" });
      test("all topic entry points land below the sticky header", async ({ page }) => {
        test.setTimeout(90_000);
        const t = translations[language];
        await page.addInitScript(language => {
          localStorage.setItem("orbit_language", language);
          localStorage.setItem("orbit_theme", "light");
          localStorage.setItem("orbit_cookie_consent", "true");
        }, language);
        const themes = [
          { id: "connected-teams", title: t["home.topicNetworks"] },
          { id: "secure-systems", title: t["home.topicSecurity"] },
          { id: "business-online", title: t["home.topicWebsites"] },
        ];
        const widths = device === "mobile" ? [320, 390] : [1280, 1440];
        for (const width of widths) {
          await page.setViewportSize({ width, height: 931 });
          await page.goto("/");
          for (const source of ["home", device === "mobile" ? "drawer" : "header", "footer"]) {
            for (const theme of themes) {
              await test.step(`${width}px ${source} → ${theme.id}`, async () => {
                if (source === "home") {
                  const link = page.locator(".home-hero").getByRole("link", { name: theme.title, exact: true });
                  await expect(link).toHaveAttribute("href", `/services#${theme.id}`);
                  if (device === "mobile") await link.tap();
                  else await link.click();
                } else if (source === "header") {
                  const header = page.locator(".site-header");
                  await header.getByRole("button", { name: t["nav.services"], exact: true }).click();
                  const link = page.locator(`[data-slot="navigation-menu-content"] a[href="/services#${theme.id}"]`);
                  await expect(link).toContainText(theme.title);
                  await link.click();
                } else if (source === "drawer") {
                  await page.getByRole("button", { name: t["nav.menu"], exact: true }).tap();
                  const drawer = page.getByRole("dialog", { name: t["nav.menu"], exact: true });
                  await drawer.locator("summary", { hasText: t["nav.services"] }).tap();
                  await drawer.getByRole("link", { name: theme.title, exact: true }).tap();
                  await expect(drawer).toHaveCount(0);
                  await expect(page.locator("body")).not.toHaveAttribute("data-scroll-locked");
                } else {
                  const navigation = page.getByRole("contentinfo").getByRole("navigation", { name: t["footer.services"], exact: true });
                  await navigation.getByRole("link", { name: theme.title, exact: true }).click();
                }
                await expect(page).toHaveURL(new RegExp(`/services#${theme.id}$`));
                const heading = page.locator(`#${theme.id}`);
                await expect(heading).toHaveText(theme.title);
                await expect(heading).toBeInViewport({ ratio: 1 });
                await expect.poll(async () => {
                  const title = await heading.boundingBox();
                  const header = await page.locator(".site-header").boundingBox();
                  return title!.y - (header!.y + header!.height);
                }, { message: `${source}: ${theme.id} must clear the sticky header by at least 8px` }).toBeGreaterThanOrEqual(8);
                expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
                if (source === "home") await page.goBack();
              });
            }
          }
        }
      });
    });
  }
}
