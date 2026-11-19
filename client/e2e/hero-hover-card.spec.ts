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
      const topic = page.locator(".home-hero").getByRole("link", { name: t[label], exact: true });
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
    const trigger = page.locator(".home-hero").getByRole("link", { name: t["home.topicNetworks"], exact: true });
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
    await page.keyboard.press("Tab");
    await page.keyboard.press("Shift+Tab");
    await expect(card).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(card).toBeHidden();
    await expect(trigger).toBeFocused();
    await trigger.press("Enter");
    await expect(page).toHaveURL(/\/services#connected-teams$/);
    await expect(page.locator("#connected-teams")).toBeInViewport();
    await page.setViewportSize({ width: 360, height: 931 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.locator("html").evaluate(el => el.setAttribute("data-theme", "orbit-dark"));
    for (const [label, id] of [
      ["home.topicNetworks", "connected-teams"],
      ["home.topicSecurity", "secure-systems"],
      ["home.topicWebsites", "business-online"],
    ] as const) {
      await page.goto("/");
      await page.locator("html").evaluate(el => el.setAttribute("data-theme", "orbit-dark"));
      const topic = page.locator(".home-hero").getByRole("link", { name: t[label], exact: true });
      await expect(topic).toHaveAttribute("href", `/services#${id}`);
      await topic.scrollIntoViewIfNeeded();
      await expect(topic.locator('[aria-hidden="true"] > span').first()).toHaveCSS("opacity", "1");
      await topic.tap();
      await expect(page).toHaveURL(new RegExp(`/services#${id}$`));
      await expect(page.locator(`#${id}`)).toBeInViewport();
      await expect(page.locator('main button[aria-haspopup="dialog"]')).toHaveCount(10);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  });
}
