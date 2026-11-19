import { expect, test } from "@playwright/test";
import { translations } from "../src/i18n/translations";

test.use({ reducedMotion: "reduce" });
for (const language of ["en", "de"] as const) {
  test(`${language}: drawer service themes collapse and navigate to catalogue sections`, async ({ page }) => {
    const t = translations[language];
    await page.addInitScript(language => {
      localStorage.setItem("orbit_language", language);
      localStorage.setItem("orbit_theme", "light");
      localStorage.setItem("orbit_cookie_consent", "true");
    }, language);
    await page.goto("/quote");
    const themes = [
      { id: "connected-teams", title: t["home.topicNetworks"] },
      { id: "secure-systems", title: t["home.topicSecurity"] },
      { id: "business-online", title: t["home.topicWebsites"] },
    ];
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 900 });
      for (const theme of themes) {
        const trigger = page.getByRole("button", { name: t["nav.menu"], exact: true });
        await trigger.click();
        const dialog = page.getByRole("dialog", { name: t["nav.menu"], exact: true });
        const services = dialog.locator("details").filter({ has: page.locator("summary", { hasText: t["nav.services"] }) });
        const summary = services.locator("summary");
        await expect(services).not.toHaveAttribute("open");
        await expect(services.getByRole("link", { includeHidden: true })).toHaveCount(3);
        await expect(services.getByText(theme.title, { exact: true })).toBeHidden();
        await summary.click();
        await expect(services).toHaveAttribute("open", "");
        await summary.click();
        await expect(services).not.toHaveAttribute("open");
        await summary.focus();
        await summary.press("Enter");
        await expect(services).toHaveAttribute("open", "");
        const link = services.getByRole("link", { name: theme.title, exact: true });
        await expect(link).toHaveAttribute("href", `/services#${theme.id}`);
        const bounds = await link.boundingBox();
        expect(bounds!.height).toBeGreaterThanOrEqual(44);
        expect(bounds!.x).toBeGreaterThanOrEqual(0);
        expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
        if (width === 320 && theme.id === "connected-teams") {
          await page.screenshot({ path: `test-results/drawer-service-groups-${language}.png` });
        }
        await link.click();
        await expect(dialog).toHaveCount(0);
        await expect(page).toHaveURL(new RegExp(`/services#${theme.id}$`));
        await expect(page.locator("body")).not.toHaveAttribute("data-scroll-locked");
        await expect(page.locator(`#${theme.id}`)).toBeInViewport();
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      }
    }
  });
}
