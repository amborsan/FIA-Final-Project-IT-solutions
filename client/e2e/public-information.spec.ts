import { expect, test } from "@playwright/test";
import { translations } from "../src/i18n/translations";

for (const language of ["en", "de"] as const) {
  test(`${language}: public project credits and privacy notice reflect the demo`, async ({ page }) => {
    await page.addInitScript(language => {
      localStorage.setItem("orbit_language", language);
      localStorage.setItem("orbit_cookie_consent", "true");
    }, language);
    await page.route("**/api/**", route => route.abort());

    await page.goto("/about");
    const workspace = page.locator('main img[src="/site-photos/workspace.webp"]');
    await expect(workspace).toBeVisible();
    await expect.poll(() => workspace.evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    for (const region of [page.getByRole("banner"), page.getByRole("contentinfo")]) {
      await expect(region.getByRole("link", { name: "IT Solutions.", exact: true })
        .locator("svg.brand-symbol")).toBeVisible();
    }
    const favicon = page.locator('link[rel="icon"]');
    await expect(favicon).toHaveAttribute("href", "/favicon.svg?v=2");
    const icon = await page.request.get("/favicon.svg?v=2");
    expect(icon.ok()).toBe(true);
    expect(icon.headers()["content-type"]).toContain("image/svg+xml");

    for (const name of ["I-Chieh Liu", "Feras Hifean", "Ali Borsan", "Otto Mueller"]) {
      await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
    }

    await page.goto("/contact");
    const contact = page.getByRole("main");
    await expect(contact.getByText(`10115 Berlin, ${translations[language]["contact.country"]}`, { exact: false })).toBeVisible();
    await expect(contact.getByRole("link", { name: "hello@fia-it.de" })).toHaveAttribute("href", "mailto:hello@fia-it.de");
    await expect(contact.getByRole("link", { name: "+49 30 5550 0100" })).toHaveAttribute("href", "tel:+493055500100");

    await page.goto("/legal/privacy");
    const notice = page.getByRole("article");
    await expect(notice.getByRole("link", { name: /Art\. 13/i })).toBeVisible();
    await expect(notice.getByRole("link", { name: /§ 25 TDDDG/i })).toBeVisible();
    await expect(notice.getByRole("link", {
      name: language === "de" ? "Beschwerderecht" : "Right to lodge a complaint",
    })).toBeVisible();
  });

  test(`${language}: public catalog shows local photography and practical detail`, async ({ page }) => {
    await page.addInitScript(language => {
      localStorage.setItem("orbit_language", language);
      localStorage.setItem("orbit_cookie_consent", "true");
    }, language);
    await page.setViewportSize({ width: 360, height: 900 });
    const t = translations[language];

    await page.goto("/services/network-solutions");
    await expect(page.getByText(t["services.scope.network-solutions.1"], { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: t["services.exampleTitle"] })).toBeVisible();
    await expect(page.getByText(t["services.example.network-solutions"], { exact: true })).toBeVisible();

    for (const [slug, file] of [
      ["cctv-surveillance", "camera-installation"],
      ["web-development", "site-development"],
    ]) {
      await page.goto(`/services/${slug}`);
      const examplePhoto = page.locator(`main img[src="/site-photos/${file}.webp"]`);
      await expect(examplePhoto).toBeVisible();
      await expect.poll(() => examplePhoto.evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    }

    await page.goto("/services");
    const servicePhoto = page.getByRole("img", { name: t["services.technicianPhoto"] });
    await expect.poll(() => servicePhoto.evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);

    await page.goto("/products/omada-switch-8");
    await expect(page.getByRole("heading", { name: t["products.compatibility"] })).toBeVisible();
    await expect(page.getByText(t["products.guidance.network"], { exact: true })).toBeVisible();
    const photo = page.locator('main img[src="/catalog/network.webp"]').first();
    await expect(photo).toBeVisible();
    await expect.poll(() => photo.evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await expect(page.getByText(t["products.illustrativeImage"]).first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);

    await page.goto("/products/lenovo-thinkpad-e14");
    const thinkpad = page.locator('main img[src="/catalog/thinkpad-e14.webp"]').first();
    await expect(thinkpad).toBeVisible();
    await expect.poll(() => thinkpad.evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await expect(page.getByText(t["products.illustrativeImage"]).first()).toBeVisible();
  });
}
