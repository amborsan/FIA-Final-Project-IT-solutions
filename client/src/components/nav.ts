import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  FileText,
  Inbox,
  LayoutDashboard,
  LifeBuoy,
  MessageSquare,
  Package,
  ShoppingBag,
  Users,
  Wrench,
} from "lucide-react";
import { useI18n } from "../i18n/I18nContext";
import type { DashboardNavItem } from "./DashboardShell";

export function usePortalNav(): DashboardNavItem[] {
  const { t } = useI18n();
  return [
    { to: "/portal", label: t("portal.dashboard"), icon: LayoutDashboard, exact: true },
    { to: "/portal/requests", label: t("portal.requests"), icon: ClipboardList },
    { to: "/portal/orders", label: t("portal.orders"), icon: ShoppingBag },
    { to: "/portal/tickets", label: t("portal.tickets"), icon: LifeBuoy },
    { to: "/portal/appointments", label: t("portal.appointments"), icon: CalendarDays },
    { to: "/portal/reports", label: t("portal.reports"), icon: FileText },
    { to: "/messages", label: t("nav.messages"), icon: MessageSquare },
    { to: "/portal/profile", label: t("portal.profile"), icon: Users },
  ];
}

export function useTechnicianNav(): DashboardNavItem[] {
  const { t } = useI18n();
  return [
    { to: "/technician", label: t("technician.overview"), icon: LayoutDashboard, exact: true },
    { to: "/technician/tasks", label: t("technician.assignedRequests"), icon: Wrench },
    { to: "/technician/tickets", label: t("technician.assignedTickets"), icon: LifeBuoy },
    { to: "/technician/appointments", label: t("technician.appointments"), icon: CalendarDays },
    { to: "/technician/reports", label: t("technician.reports"), icon: FileText },
    { to: "/messages", label: t("nav.messages"), icon: MessageSquare },
  ];
}

export function useAdminNav(): DashboardNavItem[] {
  const { t } = useI18n();
  return [
    { to: "/admin", label: t("admin.overview"), icon: LayoutDashboard, exact: true },
    { to: "/admin/requests", label: t("admin.requests"), icon: ClipboardList },
    { to: "/admin/orders", label: t("admin.orders"), icon: Package },
    { to: "/admin/tickets", label: t("admin.tickets"), icon: LifeBuoy },
    { to: "/admin/catalog", label: t("admin.catalog"), icon: ShoppingBag },
    { to: "/admin/content", label: t("admin.content"), icon: FileText },
    { to: "/admin/users", label: t("admin.users"), icon: Users },
    { to: "/admin/messages", label: t("admin.messages"), icon: MessageSquare },
    { to: "/admin/inbox", label: t("admin.inbox"), icon: Inbox },
    { to: "/admin/activity", label: t("admin.activity"), icon: BarChart3 },
  ];
}
