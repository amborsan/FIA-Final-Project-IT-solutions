import { test, expect } from "@playwright/test";

const demos = [
  { email: "admin@orbit-it.de", password: "Admin12345!", role: "ADMIN", path: "/admin" },
  { email: "tech@orbit-it.de", password: "Tech12345!", role: "TECHNICIAN", path: "/technician" },
  { email: "customer@orbit-it.de", password: "Customer12345!", role: "CUSTOMER", path: "/portal" },
  { email: "business@orbit-it.de", password: "Customer12345!", role: "CUSTOMER", path: "/portal" },
] as const;

for (const demo of demos) {
  test(`demo card signs in as ${demo.email}`, async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("orbit_language", "en");
      localStorage.setItem("orbit_cookie_consent", "true");
    });
    await page.goto("/login");
    await page.getByRole("button").filter({ hasText: demo.email }).click({ timeout: 5000 });
    await expect(page.getByLabel("Email address", { exact: true })).toHaveValue(demo.email);
    await expect(page.getByLabel("Password", { exact: true })).toHaveValue(demo.password);
    const response = page.waitForResponse(r => r.url().endsWith("/api/auth/login") && r.request().method() === "POST");
    await page.locator("form").getByRole("button", { name: "Log in", exact: true }).click();
    const result = await response;
    expect(result.status()).toBe(200);
    const { user } = await result.json();
    expect(user.email).toBe(demo.email);
    expect(user.role).toBe(demo.role);
    await expect(page).toHaveURL(new RegExp(`${demo.path}/?$`));
    const session = await page.request.get("/api/auth/me");
    expect(session.status()).toBe(200);
    expect((await session.json()).user.email).toBe(demo.email);
  });
}
