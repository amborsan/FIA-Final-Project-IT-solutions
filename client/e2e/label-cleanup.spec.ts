import { expect, test } from "@playwright/test";
import { translations } from "../src/i18n/translations";
import type { Service } from "../src/lib/types";

test.use({ reducedMotion: "reduce" });
for (const language of ["en", "de"] as const) {
  test(`${language}: simplified labels preserve page identity, legal information and quote fields`, async ({ page }) => {
    const t = translations[language];
    await page.addInitScript(language => {
      localStorage.setItem("orbit_language", language);
      localStorage.setItem("orbit_theme", "light");
      localStorage.setItem("orbit_cookie_consent", "true");
    }, language);
    await page.setViewportSize({ width: 320, height: 900 });
    for (const [route, title] of [
      ["/services", t["services.title"]], ["/products", t["products.title"]],
      ["/about", t["about.title"]], ["/contact", t["contact.title"]],
      ["/quote", t["quote.title"]], ["/blog", t["blog.title"]],
    ]) {
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1, name: title, exact: true })).toBeVisible();
      await expect(page.locator("main .eyebrow")).toHaveCount(0);
      await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    }
    for (const [route, title] of [
      ["privacy", t["legal.privacyTitle"]], ["terms", t["legal.termsTitle"]],
      ["withdrawal", t["legal.withdrawalTitle"]], ["imprint", t["legal.imprintTitle"]],
      ["cookies", t["legal.cookiesTitle"]],
    ]) {
      await page.goto(`/legal/${route}`);
      const heading = page.getByRole("heading", { level: 1, name: title, exact: true });
      await expect(heading).toBeVisible();
      await expect(heading.locator("..").locator('p.uppercase')).toHaveCount(0);
      await expect(heading.locator("..")).toContainText(t["legal.lastUpdated"]);
      await expect(page.locator("main article")).not.toBeEmpty();
      await expect(page.locator('main aside nav a')).toHaveCount(5);
    }
    await page.goto("/");
    const why = page.locator("section").filter({ has: page.getByRole("heading", { name: t["home.whyTitle"], exact: true }) });
    await expect(why.getByRole("heading", { level: 3 })).toHaveCount(4);
    await expect(why.getByText(/^0[1-4]$/)).toHaveCount(0);
    await expect(page.getByRole("region", { name: t["home.processTitle"], exact: true }).getByRole("listitem")).toHaveCount(8);

    const response = await page.request.get("/api/services");
    expect(response.ok()).toBe(true);
    const { services } = await response.json() as { services: Service[] };
    expect(services.length).toBeGreaterThan(0);
    await page.goto(`/quote?service=${services[0].id}`);
    const select = page.getByRole("combobox", { name: `${t["quote.service"]} (${t["common.optional"]})`, exact: true });
    await expect(select).toHaveValue(services[0].id);
    const blankOption = select.locator('option[value=""]');
    await expect(blankOption).toHaveText(language === "en" ? "Choose a service" : "Leistung wählen");
    expect(await select.evaluate(element => (element as HTMLSelectElement).required)).toBe(false);
    await select.selectOption("");
    await expect(select).toHaveValue("");
    expect(await page.locator("form").evaluate(form => (form as HTMLFormElement).checkValidity())).toBe(false);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(language === "en" ? "free" : "Kostenloses");
    await page.screenshot({ path: `test-results/label-cleanup-${language}-320.png`, fullPage: true });
  });
}
