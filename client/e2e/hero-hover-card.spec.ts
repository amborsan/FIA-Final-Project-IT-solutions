import { test, expect } from "@playwright/test";
import { translations } from "../src/i18n/translations";

test.use({ hasTouch: true });

for (const language of ["en", "de"] as const) {
  test(`${language}: hero hover cards support pointer, keyboard and touch`, async ({ page }) => {
    const t = translations[language];
    await page.addInitScript(language => {
      localStorage.setItem("orbit_language", language);
      localStorage.setItem("orbit_theme", "light");
      localStorage.setItem("orbit_cookie_consent", "true");
    }, language);
    await page.goto("/");
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toHaveAccessibleName(`${t["home.heroTitle"]} ${t["home.heroHighlight"]}`);
    await expect(heading.locator('[aria-hidden="true"] > span').last()).toHaveCSS("filter", "blur(0px)");
    const headingWord = heading.locator('[aria-hidden="true"] > span').first();
    for (let replay = 0; replay < 2; replay++) {
      await page.mouse.move(0, 0);
      const previousWord = await headingWord.elementHandle();
      await heading.hover();
      await expect.poll(() => previousWord!.evaluate(el => el.isConnected)).toBe(false);
      await expect(headingWord).toHaveCSS("filter", "blur(0px)");
      await expect(headingWord).toHaveCSS("opacity", "1");
    }
    for (const label of ["home.topicNetworks", "home.topicSecurity", "home.topicWebsites"] as const) {
      const topic = page.getByRole("button", { name: t[label], exact: true });
      await topic.scrollIntoViewIfNeeded();
      const word = topic.locator('[aria-hidden="true"] > span').first();
      await expect(word).toHaveCSS("opacity", "1");
      for (let replay = 0; replay < 2; replay++) {
        await page.mouse.move(0, 0);
        const previousWord = await word.elementHandle();
        await topic.hover();
        await expect.poll(() => previousWord!.evaluate(el => el.isConnected)).toBe(false);
        await expect(word).toHaveCSS("filter", "blur(0px)");
        await expect(word).toHaveCSS("opacity", "1");
      }
    }
    await page.mouse.move(0, 0);
    const trigger = page.getByRole("button", { name: t["home.topicNetworks"], exact: true });
    const card = page.locator('[data-slot="hero-service-detail"]');
    await trigger.scrollIntoViewIfNeeded();
    const revealedWord = trigger.locator('[aria-hidden="true"] > span').first();
    await expect(revealedWord).toHaveCSS("opacity", "1");
    await expect(revealedWord).toHaveCSS("filter", "blur(0px)");
    expect(await trigger.evaluate(el => parseFloat(getComputedStyle(el).fontSize))).toBe(20);
    const statsBeforeHover = await page.locator(".home-hero-stats").boundingBox();
    await trigger.hover();
    await expect(card).toBeVisible();
    expect((await page.locator(".home-hero-stats").boundingBox())!.y).toBe(statsBeforeHover!.y);
    await expect(card).toContainText(t["home.topicNetworksText"]);
    await page.screenshot({ path: `test-results/hero-hover-${language}-desktop.png` });
    await card.hover();
    await expect(card).toBeVisible();
    await page.mouse.move(0, 0);
    await expect(card).toBeHidden();
    await trigger.focus();
    await expect(card).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(card).toBeHidden();
    await expect(trigger).toBeFocused();
    await page.setViewportSize({ width: 360, height: 931 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.locator("html").evaluate(el => el.setAttribute("data-theme", "orbit-dark"));
    for (const [label, text] of [
      ["home.topicSecurity", "home.topicSecurityText"],
      ["home.topicWebsites", "home.topicWebsitesText"],
    ] as const) {
      const button = page.getByRole("button", { name: t[label], exact: true });
      await button.tap();
      await expect(button.locator('[aria-hidden="true"] > span').first()).toHaveCSS("opacity", "1");
      await expect(card).toBeVisible();
      await expect(card).toContainText(t[text]);
      const box = await card.boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(360);
      await page.screenshot({ path: `test-results/hero-hover-${language}-mobile.png` });
      await page.getByRole("heading", { level: 1 }).click();
      await expect(card).toBeHidden();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  });
}
