import { StatusSelect, StatusUpdateFeedback, useStatusUpdate } from "../components/StatusControl";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, MapPin } from "lucide-react";
import { api } from "../lib/api";
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

  const { update, pendingId, feedback } = useStatusUpdate(async (id, status) => {
    await api(`/requests/${id}/status`, { method: "PATCH", body: { status } });
    await queryClient.invalidateQueries({ queryKey: ["requests"] });
    await queryClient.invalidateQueries({ queryKey: ["profile"] });
  });

  return (
    <DashboardShell
      nav={nav}
      title={t("technician.assignedRequests")}
      subtitle={t("technician.welcomeText")}
    >
      <StatusUpdateFeedback feedback={feedback} />

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
          allLabel={t("list.allStatuses")}
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
                  <StatusSelect
                    value={request.status}
                    options={statuses}
                    reference={request.reference}
                    pending={pendingId === request.id}
                    disabled={!!pendingId}
                    onChange={status => void update(request.id, request.reference, status)}
                  />
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
