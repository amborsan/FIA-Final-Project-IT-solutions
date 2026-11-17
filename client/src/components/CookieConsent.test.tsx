import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { I18nProvider } from "../i18n/I18nContext";
import { CookieConsent } from "./CookieConsent";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children, ...props }: React.ComponentProps<"a"> & { to: string }) =>
    <a href={to} {...props}>{children}</a>,
}));

beforeEach(() => localStorage.clear());

it("offers one acknowledgement and keeps cookie information behind a disclosure", async () => {
  render(<I18nProvider><CookieConsent /></I18nProvider>);
  expect(screen.getByRole("region", { name: "Your privacy matters" })).toBeVisible();
  expect(screen.getAllByRole("button")).toHaveLength(2);
  const details = screen.getByRole("button", { name: "Cookie details" });
  expect(details).toHaveAttribute("aria-expanded", "false");
  expect(screen.getByText("Essential · Always active")).not.toBeVisible();
  await userEvent.click(details);
  expect(details).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByText("Essential · Always active")).toBeVisible();
  expect(screen.getByText("Analytics · Not used")).toBeVisible();
  expect(screen.getByRole("link", { name: "Read the privacy policy" })).toHaveAttribute("href", "/legal/privacy");
  await userEvent.click(screen.getByRole("button", { name: "Got it" }));
  expect(JSON.parse(localStorage.getItem("orbit_cookie_consent")!)).toEqual({
    essential: true, analytics: false, date: expect.any(String),
  });
  expect(screen.queryByRole("region")).not.toBeInTheDocument();
});

it("keeps saved notices hidden and reopens details from footer settings with focus return", async () => {
  localStorage.setItem("orbit_cookie_consent", "true");
  render(<I18nProvider><button>Footer settings</button><CookieConsent /></I18nProvider>);
  expect(screen.queryByRole("region")).not.toBeInTheDocument();
  const trigger = screen.getByRole("button", { name: "Footer settings" });
  trigger.focus();
  act(() => window.dispatchEvent(new Event("orbit:open-cookie-settings")));
  expect(screen.getByRole("heading", { name: "Your privacy matters" })).toHaveFocus();
  expect(screen.getByRole("button", { name: "Cookie details" })).toHaveAttribute("aria-expanded", "true");
  await userEvent.click(screen.getByRole("button", { name: "Got it" }));
  expect(trigger).toHaveFocus();
});
