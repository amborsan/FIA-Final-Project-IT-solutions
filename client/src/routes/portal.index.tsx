import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  LifeBuoy,
  Plus,
  ShoppingBag,
} from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n/I18nContext";
import { usePortalNav } from "../components/nav";
import { DashboardShell, Panel } from "../components/DashboardShell";
import { PageLoader, StatusBadge } from "../components/ui";
import type { Appointment, ProfileResponse, ServiceRequest, Ticket } from "../lib/types";

export const Route = createFileRoute("/portal/")({
  component: PortalDashboard,
});

function PortalDashboard() {
  const { user } = useAuth();
  const { t, formatDate, formatDateTime } = useI18n();
  const nav = usePortalNav();

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: () => api<ProfileResponse>("/profile"),
  });
  const requestsQuery = useQuery({
    queryKey: ["requests"],
    queryFn: () => api<{ requests: ServiceRequest[] }>("/requests"),
  });
  const ticketsQuery = useQuery({
    queryKey: ["tickets"],
    queryFn: () => api<{ tickets: Ticket[] }>("/tickets"),
  });
  const appointmentsQuery = useQuery({
    queryKey: ["appointments"],
    queryFn: () => api<{ appointments: Appointment[] }>("/appointments"),
  });
  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: () =>
      api<{ notifications: { id: string; title: string; message: string; createdAt: string; readAt?: string }[] }>(
        "/notifications",
      ),
  });

  const stats = profileQuery.data?.counts;
  const requests = (requestsQuery.data?.requests ?? []).slice(0, 5);
  const tickets = (ticketsQuery.data?.tickets ?? []).slice(0, 5);
  const appointments = (appointmentsQuery.data?.appointments ?? [])
    .filter((appointment) => appointment.status !== "CANCELLED")
    .slice(0, 3);
  const notifications = notificationsQuery.data?.notifications ?? [];

  return (
    <DashboardShell
      nav={nav}
      title={t("portal.dashboard")}
      subtitle={t("portal.welcome", { name: user?.firstName || user?.fullName || "" })}
      actions={
        <>
          <Link to="/quote" search={{ service: undefined }} className="ds-btn ds-btn-primary ds-btn-sm">
            <Plus className="h-4 w-4" /> {t("portal.newRequest")}
          </Link>
          <Link to="/portal/tickets" className="ds-btn ds-btn-outline ds-btn-sm">
            <LifeBuoy className="h-4 w-4" /> {t("portal.newTicket")}
          </Link>
        </>
      }
    >
      {profileQuery.isLoading ? (
        <PageLoader />
      ) : (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["ClipboardList", t("portal.openRequests"), stats?.requests ?? 0, "text-primary"],
              ["LifeBuoy", t("portal.openTickets"), stats?.tickets ?? 0, "text-secondary"],
              ["ShoppingBag", t("portal.totalOrders"), stats?.orders ?? 0, "text-accent"],
              ["CheckCircle2", t("portal.unread"), stats?.unreadNotifications ?? 0, "text-success"],
            ].map(([icon, label, value, color]) => {
              const icons = { ClipboardList, LifeBuoy, ShoppingBag, CheckCircle2 };
              const Icon = icons[icon as keyof typeof icons];
              return (
                <div key={String(label)} className="rounded-box border border-base-300 bg-base-100 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-base-content/65">{label}</p>
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                  <p className="mt-2 text-2xl font-black">{value}</p>
                </div>
              );
            })}
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
            <Panel
              title={t("portal.recentRequests")}
              action={
                <Link to="/portal/requests" className="ds-link ds-link-primary text-xs">
                  {t("portal.viewAll")}
                </Link>
              }
            >
              {requests.length === 0 ? (
                <EmptyLine text={t("requests.text")} />
              ) : (
                <div className="divide-y divide-base-200">
                  {requests.map((request) => (
                    <Link
                      key={request.id}
                      to="/portal/requests/$id"
                      params={{ id: request.id }}
                      className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{request.title}</p>
                        <p className="text-[11px] text-base-content/70">
                          {request.reference} · {formatDate(request.createdAt)}
                        </p>
                      </div>
                      <StatusBadge status={request.status} />
                    </Link>
                  ))}
                </div>
              )}
            </Panel>

            <Panel
              title={t("portal.upcoming")}
              action={
                <Link to="/portal/appointments" className="ds-link ds-link-primary text-xs">
                  {t("portal.viewAll")}
                </Link>
              }
            >
              {appointments.length === 0 ? (
                <EmptyLine text={t("appointments.noAppointments")} />
              ) : (
                <div className="space-y-3">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="rounded-lg bg-base-200/60 p-3">
                      <p className="text-sm font-semibold">{appointment.title}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-[11px] text-base-content/65">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatDateTime(appointment.startsAt)}
                      </p>
                      <div className="mt-2">
                        <StatusBadge status={appointment.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <Panel
              title={t("portal.recentTickets")}
              action={
                <Link to="/portal/tickets" className="ds-link ds-link-primary text-xs">
                  {t("portal.viewAll")}
                </Link>
              }
            >
              {tickets.length === 0 ? (
                <EmptyLine text={t("tickets.noTickets")} />
              ) : (
                <div className="divide-y divide-base-200">
                  {tickets.map((ticket) => (
                    <Link
                      key={ticket.id}
                      to="/portal/tickets/$id"
                      params={{ id: ticket.id }}
                      className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{ticket.subject}</p>
                        <p className="text-[11px] text-base-content/70">
                          {ticket.reference} · {formatDate(ticket.createdAt)}
                        </p>
                      </div>
                      <StatusBadge status={ticket.status} />
                    </Link>
                  ))}
                </div>
              )}
            </Panel>

            <Panel title={t("portal.notifications")}>
              {notifications.length === 0 ? (
                <EmptyLine text={t("portal.noNotifications")} />
              ) : (
                <div className="space-y-3">
                  {notifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification.id}
                      className={`rounded-lg border p-3 ${
                        notification.readAt
                          ? "border-base-200"
                          : "border-primary/20 bg-primary/5"
                      }`}
                    >
                      <p className="text-xs font-semibold">{notification.title}</p>
                      <p className="mt-0.5 text-[11px] text-base-content/65">{notification.message}</p>
                      <p className="mt-1 text-[10px] text-base-content/65">
                        {formatDateTime(notification.createdAt)}
                      </p>
                    </div>
                  ))}
                  <Link to="/portal/profile" className="flex items-center gap-1 text-xs font-semibold text-primary">
                    {t("portal.notifications")} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </Panel>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

function EmptyLine({ text }: { text: string }) {
  return <p className="py-6 text-center text-xs text-base-content/70">{text}</p>;
}
