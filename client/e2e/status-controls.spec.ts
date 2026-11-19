import { expect, test } from "@playwright/test";
import { translations } from "../src/i18n/translations";

test.use({ reducedMotion: "reduce" });
for (const role of ["admin", "technician"] as const) for (const language of ["en", "de"] as const) {
  test(`${role} ${language}: one editable status per record with read-only invoice status preserved`, async ({ page }) => {
    const t = translations[language];
    await page.addInitScript(() => {
      if (!localStorage.getItem("orbit_language")) localStorage.setItem("orbit_language", "en");
      localStorage.setItem("orbit_cookie_consent", "true");
      localStorage.setItem("orbit_theme", "light");
    });
    await page.goto("/login");
    await page.getByLabel("Email address", { exact: true }).fill(role === "admin" ? "admin@fia-it.de" : "tech@fia-it.de");
    await page.getByLabel("Password", { exact: true }).fill(role === "admin" ? "Admin12345!" : "Tech12345!");
    await page.locator("form").getByRole("button", { name: "Log in", exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/${role}/?$`));
    if (language === "de") await page.getByRole("button", { name: "DE", exact: true }).click();
    const writes: string[] = [];
    page.on("request", request => {
      if (request.url().includes("/api/") && !["GET", "HEAD", "OPTIONS"].includes(request.method())) writes.push(request.method());
    });
    const lists = role === "admin" ? [["/admin/orders", "/orders", "orders"]]
      : [["/technician/tasks", "/requests", "requests"], ["/technician/tickets", "/tickets", "tickets"]];
    for (const [route, endpoint, key] of lists) {
      await page.goto(route);
      const response = await page.request.get(`/api${endpoint}`);
      expect(response.ok()).toBe(true);
      const data = await response.json() as Record<string, { id: string; reference: string; status: string; invoice?: { status: string } | null }[]>;
      const rows = data[key].filter(row => !["COMPLETED", "CANCELLED", "RESOLVED", "CLOSED"].includes(row.status));
      expect(rows.length).toBeGreaterThan(0);
      for (const row of rows) {
        const select = page.getByRole("combobox", { name: t["statusUpdate.label"].replace("{{reference}}", row.reference), exact: true });
        await expect(select).toHaveValue(row.status);
        await expect(select).toBeEnabled();
        await expect(select).toHaveCount(1);
        await expect(select.locator("..").locator('[data-slot="badge"]')).toHaveCount(endpoint === "/tickets" ? 1 : 0);
        if (role === "admin" && row.invoice) {
          const card = select.locator("..").locator("..").locator("..");
          await expect(card.locator('[data-slot="badge"]')).toContainText([t[`status.${row.invoice.status}` as keyof typeof t]]);
        }
      }
      for (const width of [1440, 320]) {
        await page.setViewportSize({ width, height: 900 });
        await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
        await page.screenshot({ path: `test-results/status-${role}-${language}-${key}-${width}.png`, fullPage: true });
      }
    }
    expect(writes).toEqual([]);
  });
}
