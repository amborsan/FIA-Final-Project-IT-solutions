import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { createMemoryHistory, createRootRoute, createRoute, createRouter, RouterProvider } from "@tanstack/react-router";
import { I18nProvider } from "../i18n/I18nContext";
import { HeaderNavigation } from "./HeaderNavigation";

it("opens service destinations by keyboard and restores the trigger on Escape", async () => {
  const root = createRootRoute({ component: () => <HeaderNavigation services={[]} /> });
  const index = createRoute({ getParentRoute: () => root, path: "/" });
  const router = createRouter({ routeTree: root.addChildren([index]), history: createMemoryHistory({ initialEntries: ["/"] }) });
  render(<I18nProvider><RouterProvider router={router} /></I18nProvider>);
  const trigger = await screen.findByRole("button", { name: "Services" });
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  const user = userEvent.setup();
  trigger.focus();
  await user.keyboard("{Enter}");
  expect(trigger).toHaveAttribute("aria-expanded", "true");
  const nav = screen.getByRole("navigation", { name: "Site navigation" });
  expect(within(nav).getByRole("link", { name: "View all services" })).toHaveAttribute("href", "/services");
  expect(within(nav).getByRole("link", { name: "Request a quote" })).toHaveAttribute("href", "/quote");
  await user.keyboard("{Escape}");
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  expect(trigger).toHaveFocus();
});

it("keeps all products reachable when category data is unavailable", async () => {
  const root = createRootRoute({ component: () => <HeaderNavigation services={[]} /> });
  const index = createRoute({ getParentRoute: () => root, path: "/" });
  const router = createRouter({ routeTree: root.addChildren([index]), history: createMemoryHistory({ initialEntries: ["/"] }) });
  render(<I18nProvider><RouterProvider router={router} /></I18nProvider>);
  const trigger = await screen.findByRole("button", { name: "Shop" });
  trigger.focus();
  const user = userEvent.setup();
  await user.keyboard("{Enter}");
  expect(screen.getByRole("link", { name: "View all products" })).toHaveAttribute("href", "/products");
  await user.keyboard("{Escape}");
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  expect(trigger).toHaveFocus();
});
