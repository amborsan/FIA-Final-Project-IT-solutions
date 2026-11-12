import { I18nProvider } from "../i18n/I18nContext";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { ClipboardList } from "lucide-react";
import { TechnicianDashboardShell } from "./TechnicianDashboardShell";

it("preserves keyboard navigation and caller actions in the technician shell", async () => {
  const root = createRootRoute({
    component: () => (
      <TechnicianDashboardShell
        nav={[
          { to: "/technician/tasks", label: "Requests", icon: ClipboardList },
        ]}
        title="Technician"
        actions={<a href="/quote">New request</a>}
      >
        <Outlet />
      </TechnicianDashboardShell>
    ),
  });
  const overview = createRoute({
    getParentRoute: () => root,
    path: "/technician",
    component: () => <p>Overview content</p>,
  });
  const requests = createRoute({
    getParentRoute: () => root,
    path: "/technician/tasks",
    component: () => <p>Requests content</p>,
  });
  const router = createRouter({
    routeTree: root.addChildren([overview, requests]),
    history: createMemoryHistory({ initialEntries: ["/technician"] }),
  });
  render(<I18nProvider><RouterProvider router={router} /></I18nProvider>);
  await screen.findByText("Overview content");
  expect(screen.getByRole("link", { name: "New request" })).toHaveAttribute(
    "href",
    "/quote",
  );
  const user = userEvent.setup();
  await user.tab();
  await user.keyboard("{Enter}");
  expect(screen.getByRole("button", { name: "Toggle workspace sidebar" })).toHaveAttribute("aria-expanded", "false");
  expect(localStorage.getItem("fia_sidebar_expanded")).toBe("false");
  await user.tab();
  expect(screen.getByRole("link", { name: "Requests" })).toHaveFocus();
  await user.keyboard("{Enter}");
  await screen.findByText("Requests content");
  expect(router.state.location.pathname).toBe("/technician/tasks");
});
