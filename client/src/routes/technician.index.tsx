import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarDays, ClipboardList, Clock, FileText, LifeBuoy } from "lucide-react";
import { api } from "../lib/api";
import type { Appointment, ServiceReport, ServiceRequest, Ticket } from "../lib/types";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n/I18nContext";
import { useTechnicianNav } from "../components/nav";
import { DashboardShell, Panel } from "../components/DashboardShell";
import { PageLoader, StatusBadge } from "../components/ui";

export const Route = createFileRoute("/technician/")({
  component: TechnicianDashboard,
});

function TechnicianDashboard() {
  const { user } = useAuth();
  const { t, formatDateTime } = useI18n();
  const nav = useTechnicianNav();

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
  const reportsQuery = useQuery({
    queryKey: ["reports"],
    queryFn: () => api<{ reports: ServiceReport[] }>("/reports"),
  });

  const requests = requestsQuery.data?.requests ?? [];
  const tickets = ticketsQuery.data?.tickets ?? [];
  const appointments = appointmentsQuery.data?.appointments ?? [];
  const reports = reportsQuery.data?.reports ?? [];
  const openRequests = requests.filter(
    (request) => !["COMPLETED", "CANCELLED"].includes(request.status),
  );
  const openTickets = tickets.filter((ticket) => !["RESOLVED", "CLOSED"].includes(ticket.status));
  const upcoming = appointments
    .filter(
      (appointment) =>
        new Date(appointment.startsAt).getTime() >= Date.now() &&
        appointment.status !== "CANCELLED",
    )
    .slice(0, 4);

  if (requestsQuery.isLoading) {
    return (
      <DashboardShell nav={nav} title={t("technician.dashboard")}>
        <PageLoader />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      nav={nav}
      title={t("technician.dashboard")}
      subtitle={t("technician.welcome", { name: user?.firstName || user?.fullName || "" })}
      actions={
        <Link to="/technician/reports" search={{ request: undefined }} className="ds-btn ds-btn-primary ds-btn-sm">
          <FileText className="h-4 w-4" /> {t("technician.newReport")}
        </Link>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {([
            [ClipboardList, t("technician.assignedRequests"), openRequests.length],
            [LifeBuoy, t("technician.assignedTickets"), openTickets.length],
            [CalendarDays, t("technician.appointments"), appointments.length],
            [FileText, t("technician.reports"), reports.length],
          ] as const).map(([icon, label, value]) => {
            const Icon = icon as typeof ClipboardList;
            return (
              <div key={String(label)} className="rounded-box border border-base-300 bg-base-100 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-base-content/65">{label}</p>
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <p className="mt-2 text-2xl font-black">{value}</p>
              </div>
            );
          })}
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <Panel
            title={t("technician.assignedRequests")}
            action={
              <Link to="/technician/tasks" className="ds-link ds-link-primary text-xs">
                {t("portal.viewAll")}
              </Link>
            }
          >
            <div className="divide-y divide-base-200">
              {openRequests.slice(0, 6).map((request) => (
                <Link
                  key={request.id}
                  to="/technician/tasks"
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
              {openRequests.length === 0 && (
                <p className="py-6 text-center text-xs text-base-content/70">
                  {t("technician.noTasks")}
                </p>
              )}
            </div>
          </Panel>

          <Panel
            title={t("technician.appointments")}
            action={
              <Link to="/technician/appointments" className="ds-link ds-link-primary text-xs">
                {t("portal.viewAll")}
              </Link>
            }
          >
            <div className="space-y-3">
              {upcoming.map((appointment) => (
                <div key={appointment.id} className="rounded-lg bg-base-200/60 p-3">
                  <p className="text-sm font-semibold">{appointment.title}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-[11px] text-base-content/65">
                    <Clock className="h-3.5 w-3.5" /> {formatDateTime(appointment.startsAt)}
                  </p>
                  <p className="text-[11px] text-base-content/70">
                    {appointment.customer?.fullName}
                  </p>
                </div>
              ))}
              {upcoming.length === 0 && (
                <p className="py-6 text-center text-xs text-base-content/70">
                  {t("technician.noAppointments")}
                </p>
              )}
            </div>
          </Panel>
        </div>

        <Panel title={t("technician.quickLinks")}>
          <div className="grid gap-3 sm:grid-cols-3">
            <Link to="/technician/tasks" className="ds-btn ds-btn-outline justify-between">
              {t("technician.assignedRequests")} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/technician/tickets" className="ds-btn ds-btn-outline justify-between">
              {t("technician.assignedTickets")} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/technician/reports" search={{ request: undefined }} className="ds-btn ds-btn-outline justify-between">
              {t("technician.newReport")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Panel>
      </div>
    </DashboardShell>
  );
}
