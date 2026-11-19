import { expect, test } from "@playwright/test";
import { translations } from "../src/i18n/translations";
import type { Service } from "../src/lib/types";

for (const language of ["en", "de"] as const) {
  test(`${language}: compact quote form preserves optional values and submission contract`, async ({ page }) => {
    const t = translations[language];
    await page.addInitScript(language => {
      localStorage.setItem("orbit_language", language);
      localStorage.setItem("orbit_theme", "light");
      localStorage.setItem("orbit_cookie_consent", "true");
    }, language);
    const response = await page.request.get("/api/services");
    expect(response.ok()).toBe(true);
    const { services } = await response.json() as { services: Service[] };
    const service = services[0];
    expect(service).toBeTruthy();
    await page.goto(`/quote?service=${service.id}`);
    const form = page.locator("form");
    const optional = form.locator("details");
    const summary = optional.locator("summary");
    const name = form.locator('[name="contactName"]');
    const email = form.locator('[name="contactEmail"]');
    const phone = form.locator('[name="contactPhone"]');
    const budget = form.locator('[name="budget"]');
    const selected = language === "en" ? service.nameEn : service.nameDe;
    await expect(summary).toContainText(t["quote.optionalTitle"]);
    await expect(summary).toContainText(selected);
    await expect(optional).not.toHaveAttribute("open");
    await expect(phone).toBeHidden();
    await expect(form.locator('[name="serviceId"]')).toHaveValue(service.id);
    await expect(name).toHaveAttribute("autocomplete", "name");
    await expect(email).toHaveAttribute("autocomplete", "email");
    await expect(phone).toHaveAttribute("autocomplete", "tel");
    await expect(phone).toHaveAttribute("type", "tel");
    await expect(form.locator('[name="siteAddress"]')).toHaveAttribute("autocomplete", "section-site street-address");

    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const responseTime = await page.getByText(t["quote.responseTime"], { exact: true }).boundingBox();
      expect(responseTime!.y + responseTime!.height).toBeLessThan((await form.boundingBox())!.y);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      if (width !== 320) {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({ path: `test-results/quote-form-${language}-${width}.png`, fullPage: true });
      }
    }
    await name.focus();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Shift+Tab");
    await expect(name).toHaveCSS("border-color", "rgb(82, 108, 158)");
    expect(await name.evaluate(el => getComputedStyle(el).boxShadow)).not.toBe("none");
    await page.getByRole("button", { name: t["theme.switchToDark"], exact: true }).click();
    await name.focus();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Shift+Tab");
    await expect(name).toHaveCSS("border-color", "rgb(135, 159, 200)");
    await page.getByRole("button", { name: t["theme.switchToLight"], exact: true }).click();

    const submitted: Record<string, unknown>[] = [];
    // Inspect the real frontend request without creating demo records in the backend.
    await page.route("**/api/requests/public", async route => {
      submitted.push(route.request().postDataJSON());
      await route.abort("blockedbyclient");
    });
    await name.fill("Jamie Example");
    await email.fill("jamie@example.com");
    await form.locator('[name="title"]').fill("Office network upgrade");
    await form.locator('[name="description"]').fill("We need a reliable network for twelve office desks.");
    await form.locator('[name="acceptPrivacy"]').check();
    await summary.focus();
    await summary.press("Enter");
    await expect(phone).toBeVisible();
    await phone.fill("+49 30 55501234");
    await form.locator('[name="siteAddress"]').fill("Example Street 8, Berlin");
    await form.locator('[name="preferredDate"]').fill("2030-12-02");
    await budget.fill("-50");
    await summary.press("Enter");
    const send = form.getByRole("button", { name: t["quote.submit"], exact: true });
    await send.click();
    await expect(optional).toHaveAttribute("open", "");
    await expect(budget).toBeFocused();
    expect(submitted).toHaveLength(0);
    await budget.fill("2500");
    await summary.press("Enter");
    await expect(phone).toBeHidden();
    await expect(phone).toHaveValue("+49 30 55501234");
    await send.click();
    await expect.poll(() => submitted.length).toBe(1);
    expect(submitted[0]).toEqual({
      contactName: "Jamie Example", contactEmail: "jamie@example.com", contactPhone: "+49 30 55501234",
      title: "Office network upgrade", description: "We need a reliable network for twelve office desks.",
      serviceId: service.id, siteAddress: "Example Street 8, Berlin", preferredDate: "2030-12-02",
      budget: 2500, acceptPrivacy: true,
    });
    await expect(send).toBeEnabled();
    await expect(name).toHaveValue("Jamie Example");
    await expect(optional).not.toHaveAttribute("open");
    await summary.click();
    await phone.fill("");
    await form.locator('[name="siteAddress"]').fill("");
    await form.locator('[name="preferredDate"]').fill("");
    await budget.fill("");
    await form.locator('[name="serviceId"]').selectOption("");
    await summary.click();
    await send.click();
    await expect.poll(() => submitted.length).toBe(2);
    expect(submitted[1]).toEqual({
      contactName: "Jamie Example", contactEmail: "jamie@example.com", contactPhone: "",
      title: "Office network upgrade", description: "We need a reliable network for twelve office desks.",
      siteAddress: "", acceptPrivacy: true,
    });
  });
}
