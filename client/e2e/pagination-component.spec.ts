import { test, expect } from "@playwright/test";
import { translations } from "../src/i18n/translations";

for (const language of ["en", "de"] as const) {
  for (const scope of ["admin-dashboard", "customer-portal", "technician-dashboard"]) {
    test(`${language}: animated pagination in ${scope}`, async ({ page }) => {
      const t = translations[language];
      await page.addInitScript(language => localStorage.setItem("orbit_language", language), language);
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`/e2e/fixtures/pagination.html?scope=${scope}`);
      const nav = page.getByRole("navigation", { name: t["list.pagination"], exact: true });
      const previous = nav.getByRole("button", { name: t["list.previous"], exact: true });
      const next = nav.getByRole("button", { name: t["list.next"], exact: true });
      const pageButton = (number: number) => nav.getByRole("button", { name: t["list.pageLabel"].replace("{{page}}", String(number)), exact: true });
      const active = nav.locator('button[aria-current="page"]:not([inert])');
      await expect(previous).toBeDisabled();
      await pageButton(3).click();
      await expect(active).toHaveText("3");
      await expect(page.getByTestId("records").locator("li").first()).toHaveText("21");
      await nav.getByRole("button", { name: t["list.jumpForward"].replace("{{count}}", "5"), exact: true }).click();
      await expect(active).toHaveText("8");
      await previous.focus();
      await page.keyboard.press("Enter");
      await expect(active).toHaveText("7");
      await expect(active).toBeFocused();
      await pageButton(20).click();
      await expect(active).toHaveText("20");
      await expect(next).toBeDisabled();
      await page.getByRole("combobox", { name: t["list.rows"], exact: true }).selectOption("25");
      await expect(active).toHaveText("1");
      await expect(page.getByTestId("records").locator("li")).toHaveCount(25);
      await pageButton(3).click();
      await page.getByPlaceholder(t["list.searchActivity"]).fill("199");
      await expect(active).toHaveText("1");
      await expect(page.getByTestId("records").locator("li")).toHaveText(["199"]);
      await expect(previous).toBeDisabled();
      await expect(next).toBeDisabled();
      await page.getByPlaceholder(t["list.searchActivity"]).fill("999");
      await expect(nav).toBeHidden();
      await page.getByPlaceholder(t["list.searchActivity"]).fill("");
      await expect(active).toHaveText("1");
      await page.screenshot({ path: `test-results/pagination-${language}-${scope}-desktop.png` });
      await page.setViewportSize({ width: 320, height: 800 });
      await expect.poll(async () => nav.locator("li:not([inert])").count()).toBeLessThanOrEqual(7);
      const bounds = await nav.boundingBox();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
      await next.click();
      await expect(active).toHaveText("2");
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.locator("html").evaluate(el => el.setAttribute("data-theme", "orbit-dark"));
      await next.click();
      await expect(active).toHaveText("3");
      await expect.poll(() => active.evaluate(el => getComputedStyle(el.parentElement!).opacity)).toBe("1");
      const colors = await active.evaluate(el => ({
        text: getComputedStyle(el).color,
        background: getComputedStyle(el.querySelector('span[aria-hidden="true"]')!).backgroundColor,
      }));
      expect(colors.text).not.toBe(colors.background);
      await page.screenshot({ path: `test-results/pagination-${language}-${scope}-mobile-dark.png` });
    });
  }
}
