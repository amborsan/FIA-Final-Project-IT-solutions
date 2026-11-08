import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Activity as ActivityIcon,
  AlertTriangle,
  ClipboardList,
  Euro,
  LifeBuoy,
  ShoppingBag,
  Users,
} from "lucide-react";
import { api } from "../lib/api";
import type { AdminDashboard } from "../lib/types";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n/I18nContext";
import { useAdminNav } from "../components/nav";
import { DashboardShell, Panel } from "../components/DashboardShell";
import { PageLoader, StatusBadge } from "../components/ui";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const { user } = useAuth();
  const { t, formatDateTime, formatMoney } = useI18n();
  const nav = useAdminNav();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => api<AdminDashboard>("/admin/stats"),
  });

  const stats = data?.stats;

  return (
    <DashboardShell
      nav={nav}
      title={t("admin.dashboard")}
      subtitle={t("admin.welcome", { name: user?.firstName || user?.fullName || "" })}
      actions={
        <Link to="/admin/requests" className="ds-btn ds-btn-primary ds-btn-sm">
          <ClipboardList className="h-4 w-4" /> {t("admin.requests")}
        </Link>
      }
    >
      {isLoading && <PageLoader />}
      {stats && (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-box border border-base-300 bg-base-100 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-base-content/65">{t("admin.stats.users")}</p>
                <Users className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-1 text-2xl font-black">{stats.users}</p>
              <p className="text-[10px] text-base-content/70">{stats.customers} {t("admin.stats.customers").toLowerCase()}</p>
            </div>
            <div className="rounded-box border border-base-300 bg-base-100 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-base-content/65">{t("admin.stats.openRequests")}</p>
                <ClipboardList className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-1 text-2xl font-black">{stats.openRequests}</p>
              <p className="text-[10px] text-base-content/70">{t("admin.requests")}</p>
            </div>
            <div className="rounded-box border border-base-300 bg-base-100 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-base-content/65">{t("admin.stats.openTickets")}</p>
                <LifeBuoy className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-1 text-2xl font-black">{stats.openTickets}</p>
              <p className="text-[10px] text-base-content/70">{t("admin.tickets")}</p>
            </div>
            <div className="rounded-box border border-base-300 bg-base-100 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-base-content/65">{t("admin.stats.orders")}</p>
                <ShoppingBag className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-1 text-2xl font-black">{stats.orders}</p>
              <p className="text-[10px] text-base-content/70">{t("admin.orders")}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-box border border-base-300 bg-primary p-4 text-primary-content">
              <p className="flex items-center gap-1.5 text-xs opacity-75">
                <Euro className="h-3.5 w-3.5" /> {t("admin.stats.revenue")}
              </p>
              <p className="mt-1 text-2xl font-black">{formatMoney(stats.revenue)}</p>
            </div>
            <div className="rounded-box border border-base-300 bg-base-100 p-4">
              <p className="flex items-center gap-1.5 text-xs text-base-content/65">
                <Users className="h-3.5 w-3.5" /> {t("admin.stats.customers")}
              </p>
              <p className="mt-1 text-2xl font-black">{stats.customers}</p>
            </div>
            <div className="rounded-box border border-base-300 bg-base-100 p-4">
              <p className="flex items-center gap-1.5 text-xs text-base-content/65">
                <Users className="h-3.5 w-3.5" /> {t("admin.stats.technicians")}
              </p>
              <p className="mt-1 text-2xl font-black">{stats.technicians}</p>
            </div>
            <div className="rounded-box border border-warning/30 bg-warning/10 p-4">
              <p className="flex items-center gap-1.5 text-xs text-warning-content/70">
                <AlertTriangle className="h-3.5 w-3.5" /> {t("admin.stats.lowStock")}
              </p>
              <p className="mt-1 text-2xl font-black">{stats.lowStock}</p>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <Panel
              title={t("admin.recentRequests")}
              action={
                <Link to="/admin/requests" className="ds-link ds-link-primary text-xs">
                  {t("portal.viewAll")}
                </Link>
              }
            >
              <div className="divide-y divide-base-200">
                {(data?.recentRequests ?? []).map((request) => (
                  <Link
                    key={request.id}
                    to="/admin/requests/$id"
                    params={{ id: request.id }}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{request.title}</p>
                      <p className="text-[11px] text-base-content/70">
                        {request.reference} · {request.customer?.fullName || request.contactName}
                      </p>
                    </div>
                    <StatusBadge status={request.status} />
                  </Link>
                ))}
              </div>
            </Panel>

            <Panel
              title={t("admin.recentTickets")}
              action={
                <Link to="/admin/tickets" className="ds-link ds-link-primary text-xs">
                  {t("portal.viewAll")}
                </Link>
              }
            >
              <div className="divide-y divide-base-200">
                {(data?.recentTickets ?? []).map((ticket) => (
                  <Link
                    key={ticket.id}
                    to="/admin/tickets"
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{ticket.subject}</p>
                      <p className="text-[11px] text-base-content/70">
                        {ticket.reference} · {ticket.customer?.fullName}
                      </p>
                    </div>
                    <StatusBadge status={ticket.status} />
                  </Link>
                ))}
              </div>
            </Panel>
          </div>

          <Panel
            title={t("admin.recentActivity")}
            action={
              <Link to="/admin/activity" className="ds-link ds-link-primary text-xs">
                {t("portal.viewAll")}
              </Link>
            }
          >
            <div className="space-y-2">
              {(data?.recentActivity ?? []).map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 rounded-lg bg-base-200/50 p-2.5">
                  <ActivityIcon className="mt-0.5 h-3.5 w-3.5 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs">{entry.description}</p>
                    <p className="text-[10px] text-base-content/70">
                      {entry.user?.fullName || "System"} · {formatDateTime(entry.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

        </div>
      )}
    </DashboardShell>
  );
}
