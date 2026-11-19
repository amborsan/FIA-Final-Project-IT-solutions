import { expect, test } from "@playwright/test";
import { translations } from "../src/i18n/translations";

for (const language of ["en", "de"] as const) {
  for (const width of [320, 360, 390, 430]) {
    test(`${language}: public buttons fit ${width}px touch screens`, async ({ browser }) => {
      test.setTimeout(120_000);
      const context = await browser.newContext({
        viewport: { width, height: 900 }, isMobile: true, hasTouch: true,
        reducedMotion: "reduce",
      });
      await context.addInitScript(language => {
        localStorage.setItem("orbit_language", language);
        localStorage.setItem("orbit_cookie_consent", "true");
      }, language);
      const page = await context.newPage();
      const routes = ["/", "/services", "/products", "/about", "/contact", "/blog", "/quote", "/cart", "/login", "/register"];
      const failures: string[] = [];
      for (const route of routes) {
        await page.goto(route);
        await page.waitForLoadState("networkidle");
        // Include actual detail pages so the back links and purchase CTAs are checked.
        if (["/services", "/products", "/blog"].includes(route)) {
          const links = page.locator(`main a[href^="${route}/"]`);
          const detail = await links.count() ? await links.first().getAttribute("href") : null;
          if (detail && !routes.includes(detail)) routes.push(detail);
        }
        if (route.startsWith("/products/")) {
          const add = page.getByRole("button", { name: translations[language]["products.addToCart"], exact: true }).first();
          if (await add.count() && await add.isEnabled()) {
            await add.click();
            routes.push("/cart");
          }
        }
        if (width === 320 && ["/", "/services/network-solutions"].includes(route)) {
          await page.screenshot({ path: `test-results/mobile-buttons-${language}-${route === "/" ? "home" : "service"}.png`, fullPage: true });
        }
        const issues = await page.evaluate(() => {
          const problems: string[] = [];
          const width = document.documentElement.clientWidth;
          if (document.documentElement.scrollWidth > width + 1) problems.push("page overflows horizontally");
          for (const el of document.querySelectorAll<HTMLElement>('a.rounded-pill, button.rounded-pill, main a:has(.lucide-arrow-left), main a:has(.lucide-arrow-right)')) {
            if (!el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) || el.closest('[inert]')) continue;
            const rect = el.getBoundingClientRect();
            if (!rect.width || !rect.height) continue;
            const label = el.innerText.trim().replace(/\s+/g, " ").slice(0, 65);
            const style = getComputedStyle(el);
            const inScroller = (node: HTMLElement | null): boolean => {
              if (!node) return false;
              return /auto|scroll/.test(getComputedStyle(node).overflowX) || inScroller(node.parentElement);
            };
            if (!inScroller(el.parentElement) && (rect.left < -1 || rect.right > width + 1)) problems.push(`${label}: outside viewport`);
            // Notification badges intentionally extend beyond their icon button.
            if (el.scrollWidth > el.clientWidth + 1 && !el.querySelector('[class~="absolute"]')) problems.push(`${label}: content clipped`);
            if (el.classList.contains("rounded-pill") && style.whiteSpace !== "nowrap") problems.push(`${label}: text can wrap`);
            if (el.classList.contains("rounded-pill") && el.tagName === "A" && !el.closest("header") && rect.height < 44) problems.push(`${label}: touch target shorter than 44px`);
            const arrow = el.querySelector(".lucide-arrow-left, .lucide-arrow-right");
            if (arrow && getComputedStyle(arrow).transform !== "none") problems.push(`${label}: touch arrow should stay at rest`);
          }
          return problems;
        });
        failures.push(...issues.map(issue => `${route}: ${issue}`));
        if (route.startsWith("/services/")) {
          await page.emulateMedia({ reducedMotion: "no-preference" });
          const back = page.locator("main a:has(.lucide-arrow-left)").first();
          await back.hover();
          await expect(back.locator(".lucide-arrow-left")).toHaveCSS("transform", "none");
          await page.emulateMedia({ reducedMotion: "reduce" });
        }
        if (route === "/") {
          const actions = page.locator(".home-hero-actions");
          const gap = await actions.evaluate(el => parseFloat(getComputedStyle(el).gap));
          expect(gap).toBeGreaterThanOrEqual(12);
        }
      }
      await context.close();
      expect(failures).toEqual([]);
    });
  }
}
