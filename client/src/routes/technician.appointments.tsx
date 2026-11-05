import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, MapPin, UserRound } from "lucide-react";
import { api, errorMessage } from "../lib/api";
import type { Appointment } from "../lib/types";
import { useI18n } from "../i18n/I18nContext";
import { useTechnicianNav } from "../components/nav";
import { DashboardShell } from "../components/DashboardShell";
import { EmptyState, ErrorState, PageLoader, StatusBadge } from "../components/ui";

export const Route = createFileRoute("/technician/appointments")({
  component: TechnicianAppointmentsPage,
});

const statuses = ["SCHEDULED", "CONFIRMED", "COMPLETED", "CANCELLED"];

function TechnicianAppointmentsPage() {
  const { t, formatDateTime } = useI18n();
  const nav = useTechnicianNav();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["appointments"],
    queryFn: () => api<{ appointments: Appointment[] }>("/appointments"),
  });

  const appointments = data?.appointments ?? [];

  async function updateStatus(id: string, status: string) {
    try {
      await api(`/appointments/${id}/status`, { method: "PATCH", body: { status } });
      await queryClient.invalidateQueries({ queryKey: ["appointments"] });
    } catch (caught) {
      setError(errorMessage(caught, t("common.error")));
    }
  }

  return (
    <DashboardShell nav={nav} title={t("technician.appointments")} subtitle={t("appointments.text")}>
      {error && <div className="alert alert-error mb-4 text-sm">{error}</div>}
      {isLoading && <PageLoader />}
      {isError && <ErrorState onRetry={() => void refetch()} />}
      {!isLoading && !isError && appointments.length === 0 && (
        <EmptyState title={t("technician.noAppointments")} />
      )}

      <div className="space-y-3">
        {appointments.map((appointment) => (
          <div key={appointment.id} className="rounded-box border border-base-300 bg-base-100 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <CalendarDays className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold">{appointment.title}</p>
                  <p className="mt-1 text-xs text-base-content/65">
                    {formatDateTime(appointment.startsAt)} –{" "}
                    {new Date(appointment.endsAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={appointment.status} />
                <select
                  value={appointment.status}
                  onChange={(event) => void updateStatus(appointment.id, event.target.value)}
                  className="select select-bordered select-xs"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {t(`status.${status}` as "status.SCHEDULED")}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-base-content/65">
              <span className="flex items-center gap-1.5">
                <UserRound className="h-3.5 w-3.5" /> {appointment.customer?.fullName}
              </span>
              {appointment.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> {appointment.location}
                </span>
              )}
              {appointment.request && (
                <span className="font-mono text-[11px]">{appointment.request.reference}</span>
              )}
            </div>
            {appointment.notes && (
              <p className="mt-2 rounded-lg bg-base-200/70 p-2 text-xs text-base-content/70">
                {appointment.notes}
              </p>
            )}
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
