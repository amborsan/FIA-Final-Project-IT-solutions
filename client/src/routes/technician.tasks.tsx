import { buttonVariants } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { NativeSelect } from "@/components/ui/native-select";
import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, MapPin } from "lucide-react";
import { api, errorMessage } from "../lib/api";
import type { ServiceRequest } from "../lib/types";
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

const archivedStatuses = new Set(["COMPLETED", "CANCELLED"]);

function TechnicianTasksPage() {
  const { t, pick, formatDate } = useI18n();
  const nav = useTechnicianNav();
  const queryClient = useQueryClient();
  const controls = useListControls();
  const [error, setError] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["requests"],
    queryFn: () => api<{ requests: ServiceRequest[] }>("/requests"),
  });

  const requests = data?.requests ?? [];

  const filtered = filterByArchive(
    requests.filter(
      (request) =>
        (!controls.status || request.status === controls.status) &&
        matchesSearch(
          controls.search,
          request.reference,
          request.title,
          request.customer?.fullName,
          request.contactName,
          request.contactEmail,
          request.siteAddress,
        ),
    ),
    controls.archive,
    (request) => archivedStatuses.has(request.status),
  );

  const pageData = paginate(filtered, controls.page, controls.pageSize);

  async function updateStatus(id: string, status: string) {
    setError("");
    try {
      await api(`/requests/${id}/status`, {
        method: "PATCH",
        body: { status },
      });
      await queryClient.invalidateQueries({ queryKey: ["requests"] });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
    } catch (caught) {
      setError(errorMessage(caught, t("common.error")));
    }
  }

  return (
    <DashboardShell
      nav={nav}
      title={t("technician.assignedRequests")}
      subtitle={t("technician.welcomeText")}
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
          placeholder={t("list.searchRequests")}
        />
        <FilterSelect
          value={controls.status}
          onChange={controls.setStatus}
          options={statuses.map((value) => ({
            value,
            label: t(`status.${value}` as "status.NEW"),
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
          <EmptyState title={t("technician.noTasks")} />
        </div>
      )}

      {pageData.total > 0 && (
        <div className="mt-5 space-y-3">
          {pageData.items.map((request) => (
            <div
              key={request.id}
              className="rounded-box border border-base-300 bg-base-100 p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="tabular-nums text-xs text-ink-muted">
                      {request.reference}
                    </span>
                    <StatusBadge status={request.status} />
                  </div>
                  <h2 className="mt-1 text-base font-medium">
                    {request.title}
                  </h2>
                  <p className="mt-1 text-xs text-ink-muted">
                    {request.service
                      ? pick(request.service.nameEn, request.service.nameDe)
                      : "–"}{" "}
                    · {request.customer?.fullName || request.contactName}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <NativeSelect
                    value={request.status}
                    onChange={(event) =>
                      void updateStatus(request.id, event.target.value)
                    }
                    className={cn(" h-6 px-2 text-xs")}
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {t(`status.${status}` as "status.NEW")}
                      </option>
                    ))}
                  </NativeSelect>
                  <Link
                    to="/technician/reports"
                    search={{ request: request.id }}
                    className={cn(
                      buttonVariants(),
                      " border-current bg-transparent text-base-content hover:bg-base-content/10 h-6 px-2 text-xs",
                    )}
                  >
                    <FileText className="h-3.5 w-3.5" />{" "}
                    {t("technician.addReport")}
                  </Link>
                </div>
              </div>

              <p className="mt-3 whitespace-pre-wrap text-xs leading-relaxed text-ink-muted">
                {request.description}
              </p>

              <div className="mt-3 flex flex-wrap gap-4 border-t border-hairline pt-3 text-xs text-ink-muted">
                <span>
                  {t("requests.preferredDate")}:{" "}
                  {formatDate(request.preferredDate)}
                </span>
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
