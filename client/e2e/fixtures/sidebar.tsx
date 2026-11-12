// Test-only component harness: real navigation components, no API or auth mocks.
import { createRoot } from "react-dom/client";
import { createMemoryHistory, createRootRoute, createRoute, createRouter, Outlet, RouterProvider, useRouterState } from "@tanstack/react-router";
import { I18nProvider, useI18n } from "../../src/i18n/I18nContext";
import { DashboardShell } from "../../src/components/DashboardShell";
import { useAdminNav, usePortalNav, useTechnicianNav } from "../../src/components/nav";
import "../../src/index.css";
import "../../src/components/AdminDashboardShell.css";
import "../../src/components/CustomerPortalShell.css";
import "../../src/components/TechnicianDashboardShell.css";

const role = new URLSearchParams(location.search).get("role") ?? "technician";
const rootPath = role === "customer" ? "/portal" : `/${role}`;
const scope = role === "customer" ? "customer-portal" : `${role}-dashboard`;

function Shell() {
  const admin = useAdminNav(), customer = usePortalNav(), technician = useTechnicianNav();
  const nav = role === "admin" ? admin : role === "customer" ? customer : technician;
  const { t } = useI18n();
  return <div className={scope}>
    <button type="button" data-testid="outside">{t("nav.home")}</button>
    <DashboardShell nav={nav} title={t("portal.dashboard")}><Outlet /></DashboardShell>
  </div>;
}
function Content() {
  const pathname = useRouterState({ select: s => s.location.pathname });
  const { t } = useI18n();
  return <><output data-testid="fixture-path">{pathname}</output><label>{t("common.name")}<input /></label></>;
}
const root = createRootRoute({ component: Shell });
const destinations = role === "admin" ? ["requests", "orders", "tickets", "catalog", "content", "users", "messages", "inbox", "activity"]
  : role === "customer" ? ["requests", "orders", "tickets", "appointments", "reports", "profile"] : ["tasks", "tickets", "appointments", "reports"];
const routeTree = root.addChildren([rootPath, ...destinations.map(path => `${rootPath}/${path}`), "/messages"].map(path => createRoute({ getParentRoute: () => root, path, component: Content })));
const router = createRouter({ routeTree, history: createMemoryHistory({ initialEntries: [rootPath] }) });
createRoot(document.getElementById("root")!).render(<I18nProvider><RouterProvider router={router} /></I18nProvider>);
