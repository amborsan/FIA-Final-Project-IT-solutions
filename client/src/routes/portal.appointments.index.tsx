import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Clock, MapPin, UserRound } from "lucide-react";
import { api, errorMessage } from "../lib/api";
import type { Appointment } from "../lib/types";
import { useI18n } from "../i18n/I18nContext";
import { usePortalNav } from "../components/nav";
import { DashboardShell } from "../components/DashboardShell";
import { EmptyState, ErrorState, PageLoader, StatusBadge } from "../components/ui";

export const Route = createFileRoute("/portal/appointments/")({
  component: AppointmentsPage,
});

function AppointmentsPage() {
  const { t, formatDateTime } = useI18n();
  const nav = usePortalNav();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["appointments"],
    queryFn: () => api<{ appointments: Appointment[] }>("/appointments"),
  });

  const now = Date.now();
  const appointments = data?.appointments ?? [];
  const upcoming = appointments.filter(
    (appointment) => new Date(appointment.endsAt).getTime() >= now && appointment.status !== "CANCELLED",
  );
  const past = appointments.filter(
    (appointment) => new Date(appointment.endsAt).getTime() < now || appointment.status === "CANCELLED",
  );

  async function updateStatus(id: string, status: string) {
    setError("");
    try {
      await api(`/appointments/${id}/status`, { method: "PATCH", body: { status } });
      await queryClient.invalidateQueries({ queryKey: ["appointments"] });
    } catch (caught) {
      setError(errorMessage(caught, t("common.error")));
    }
  }

  function renderList(list: Appointment[], empty: string) {
    if (list.length === 0) {
      return <EmptyState title={empty} />;
    }
    return (
      <div className="space-y-3">
        {list.map((appointment) => (
          <div
            key={appointment.id}
            className="rounded-box border border-base-300 bg-base-100 p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <CalendarDays className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold">{appointment.title}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-base-content/65">
                    <Clock className="h-3.5 w-3.5" /> {formatDateTime(appointment.startsAt)} –{" "}
                    {new Date(appointment.endsAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <StatusBadge status={appointment.status} />
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-base-content/65">
              {appointment.technician && (
                <span className="flex items-center gap-1.5">
                  <UserRound className="h-3.5 w-3.5" /> {appointment.technician.fullName}
                </span>
              )}
              {appointment.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> {appointment.location}
                </span>
              )}
            </div>
            {appointment.notes && (
              <p className="mt-2 rounded-lg bg-base-200/70 p-2 text-xs text-base-content/70">
                {appointment.notes}
              </p>
            )}
            {appointment.status === "SCHEDULED" && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => void updateStatus(appointment.id, "CONFIRMED")}
                  className="ds-btn ds-btn-success ds-btn-xs"
                >
                  {t("appointments.confirm")}
                </button>
                <button
                  onClick={() => void updateStatus(appointment.id, "CANCELLED")}
                  className="ds-btn ds-btn-ghost ds-btn-xs text-error"
                >
                  {t("appointments.cancel")}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <DashboardShell nav={nav} title={t("appointments.title")} subtitle={t("appointments.text")}>
      {error && <div role="alert" className="ds-alert ds-alert-error mb-4 text-sm">{error}</div>}
      {isLoading && <PageLoader />}
      {isError && <ErrorState onRetry={() => void refetch()} />}
      {!isLoading && !isError && (
        <div className="space-y-8">
          <section>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-base-content/65">
              {t("appointments.upcoming")}
            </h2>
            {renderList(upcoming, t("appointments.noAppointments"))}
          </section>
          {past.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-base-content/65">
                {t("appointments.past")}
              </h2>
              {renderList(past, t("appointments.noAppointments"))}
            </section>
          )}
        </div>
      )}
    </DashboardShell>
  );
}
