import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { NativeSelect } from "@/components/ui/native-select";
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, MapPin, UserRound } from "lucide-react";
import { api, errorMessage } from "../lib/api";
import type { Appointment } from "../lib/types";
import { useI18n } from "../i18n/I18nContext";
import { useTechnicianNav } from "../components/nav";
import { TechnicianDashboardShell as DashboardShell } from "../components/TechnicianDashboardShell";
import {
  ArchiveTabs,
  FilterSelect,
  ListToolbar,
  Pagination,
  SearchField,
} from "../components/ListControls";
import {
  EmptyState,
  ErrorState,
  PageLoader,
  StatusBadge,
} from "../components/ui";
import {
  filterByArchive,
  matchesSearch,
  paginate,
  useListControls,
} from "../lib/list";

export const Route = createFileRoute("/technician/appointments")({
  component: TechnicianAppointmentsPage,
});

const statuses = ["SCHEDULED", "CONFIRMED", "COMPLETED", "CANCELLED"];
const archivedStatuses = new Set(["COMPLETED", "CANCELLED"]);

function TechnicianAppointmentsPage() {
  const { t, formatDateTime } = useI18n();
  const nav = useTechnicianNav();
  const queryClient = useQueryClient();
  const controls = useListControls(10);
  const [error, setError] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["appointments"],
    queryFn: () => api<{ appointments: Appointment[] }>("/appointments"),
  });

  const appointments = data?.appointments ?? [];

  const filtered = filterByArchive(
    appointments.filter(
      (appointment) =>
        (!controls.status || appointment.status === controls.status) &&
        matchesSearch(
          controls.search,
          appointment.title,
          appointment.location,
          appointment.customer?.fullName,
          appointment.request?.reference,
        ),
    ),
    controls.archive,
    (appointment) => archivedStatuses.has(appointment.status),
  );

  const pageData = paginate(filtered, controls.page, controls.pageSize);

  async function updateStatus(id: string, status: string) {
    try {
      await api(`/appointments/${id}/status`, {
        method: "PATCH",
        body: { status },
      });
      await queryClient.invalidateQueries({ queryKey: ["appointments"] });
    } catch (caught) {
      setError(errorMessage(caught, t("common.error")));
    }
  }

  return (
    <DashboardShell
      nav={nav}
      title={t("technician.appointments")}
      subtitle={t("appointments.text")}
    >
      {error && (
        <Alert
          className={cn(
            "flex flex-col items-start gap-4 rounded-box border border-base-300 bg-base-200 p-4 sm:flex-row sm:items-center bg-error text-error-content border-error mb-4 text-sm",
          )}
        >
          {error}
        </Alert>
      )}

      <ListToolbar>
        <SearchField
          value={controls.search}
          onChange={controls.setSearch}
          placeholder={t("list.searchAppointments")}
        />
        <FilterSelect
          value={controls.status}
          onChange={controls.setStatus}
          options={statuses.map((value) => ({
            value,
            label: t(`status.${value}` as "status.SCHEDULED"),
          }))}
          allLabel={t("common.all")}
          ariaLabel={t("common.status")}
        />
        <ArchiveTabs value={controls.archive} onChange={controls.setArchive} />
      </ListToolbar>

      {isLoading && <PageLoader />}
      {isError && <ErrorState onRetry={() => void refetch()} />}
      {!isLoading && !isError && pageData.total === 0 && (
        <div className="mt-5">
          <EmptyState title={t("technician.noAppointments")} />
        </div>
      )}

      {pageData.total > 0 && (
        <div className="mt-5 space-y-3">
          {pageData.items.map((appointment) => (
            <div
              key={appointment.id}
              className="rounded-box border border-base-300 bg-base-100 p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent-sky text-ink">
                    <CalendarDays className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">{appointment.title}</p>
                    <p className="mt-1 text-xs text-ink-muted">
                      {formatDateTime(appointment.startsAt)} –{" "}
                      {new Date(appointment.endsAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={appointment.status} />
                  <NativeSelect
                    value={appointment.status}
                    onChange={(event) =>
                      void updateStatus(appointment.id, event.target.value)
                    }
                    className={cn(" h-6 px-2 text-xs")}
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {t(`status.${status}` as "status.SCHEDULED")}
                      </option>
                    ))}
                  </NativeSelect>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-ink-muted">
                <span className="flex items-center gap-1.5">
                  <UserRound className="h-3.5 w-3.5" />{" "}
                  {appointment.customer?.fullName}
                </span>
                {appointment.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> {appointment.location}
                  </span>
                )}
                {appointment.request && (
                  <span className="tabular-nums text-xs">
                    {appointment.request.reference}
                  </span>
                )}
              </div>
              {appointment.notes && (
                <p className="mt-2 rounded-lg bg-base-200/70 p-2 text-xs text-ink-muted">
                  {appointment.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <Pagination
        page={pageData.page}
        totalPages={pageData.totalPages}
        from={pageData.from}
        to={pageData.to}
        total={pageData.total}
        pageSize={controls.pageSize}
        onPageChange={controls.setPage}
        onPageSizeChange={controls.setPageSize}
      />
    </DashboardShell>
  );
}
