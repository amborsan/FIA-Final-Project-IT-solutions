import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, MapPin } from "lucide-react";
import { api, errorMessage } from "../lib/api";
import type { ServiceRequest } from "../lib/types";
import { useI18n } from "../i18n/I18nContext";
import { useTechnicianNav } from "../components/nav";
import { DashboardShell } from "../components/DashboardShell";
import { EmptyState, ErrorState, PageLoader, StatusBadge } from "../components/ui";

export const Route = createFileRoute("/technician/tasks")({
  component: TechnicianTasksPage,
});

const statuses = [
  "NEW",
  "REVIEWING",
  "QUOTED",
  "APPROVED",
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

function TechnicianTasksPage() {
  const { t, pick, formatDate } = useI18n();
  const nav = useTechnicianNav();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["requests"],
    queryFn: () => api<{ requests: ServiceRequest[] }>("/requests"),
  });

  const requests = data?.requests ?? [];

  async function updateStatus(id: string, status: string) {
    setError("");
    try {
      await api(`/requests/${id}/status`, { method: "PATCH", body: { status } });
      await queryClient.invalidateQueries({ queryKey: ["requests"] });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
    } catch (caught) {
      setError(errorMessage(caught, t("common.error")));
    }
  }

  return (
    <DashboardShell nav={nav} title={t("technician.assignedRequests")} subtitle={t("technician.welcomeText")}>
      {error && <div className="alert alert-error mb-4 text-sm">{error}</div>}
      {isLoading && <PageLoader />}
      {isError && <ErrorState onRetry={() => void refetch()} />}
      {!isLoading && !isError && requests.length === 0 && <EmptyState title={t("technician.noTasks")} />}

      <div className="space-y-3">
        {requests.map((request) => (
          <div key={request.id} className="rounded-box border border-base-300 bg-base-100 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] text-base-content/70">{request.reference}</span>
                  <StatusBadge status={request.status} />
                </div>
                <h2 className="mt-1 text-base font-bold">{request.title}</h2>
                <p className="mt-1 text-xs text-base-content/65">
                  {request.service ? pick(request.service.nameEn, request.service.nameDe) : "–"} ·{" "}
                  {request.customer?.fullName || request.contactName}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={request.status}
                  onChange={(event) => void updateStatus(request.id, event.target.value)}
                  className="select select-bordered select-xs"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {t(`status.${status}` as "status.NEW")}
                    </option>
                  ))}
                </select>
                <Link
                  to="/technician/reports"
                  search={{ request: request.id }}
                  className="btn btn-outline btn-xs"
                >
                  <FileText className="h-3.5 w-3.5" /> {t("technician.addReport")}
                </Link>
              </div>
            </div>

            <p className="mt-3 whitespace-pre-wrap text-xs leading-relaxed text-base-content/70">
              {request.description}
            </p>

            <div className="mt-3 flex flex-wrap gap-4 border-t border-base-200 pt-3 text-[11px] text-base-content/65">
              <span>{t("requests.preferredDate")}: {formatDate(request.preferredDate)}</span>
              {request.siteAddress && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {request.siteAddress}
                </span>
              )}
              <span>{request.contactEmail}</span>
              {request.contactPhone && <span>{request.contactPhone}</span>}
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
