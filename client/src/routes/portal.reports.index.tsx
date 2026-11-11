import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Download, FileText, UserRound } from "lucide-react";
import { api, downloadFile } from "../lib/api";
import type { ServiceReport } from "../lib/types";
import { useI18n } from "../i18n/I18nContext";
import { usePortalNav } from "../components/nav";
import { Panel } from "../components/DashboardShell";
import { CustomerPortalShell as DashboardShell } from "../components/CustomerPortalShell";
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

export const Route = createFileRoute("/portal/reports/")({
  component: ReportsPage,
});

const reportStatuses = ["SUBMITTED", "APPROVED"];

function ReportsPage() {
  const { t, formatDate } = useI18n();
  const nav = usePortalNav();
  const controls = useListControls(6);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["reports"],
    queryFn: () => api<{ reports: ServiceReport[] }>("/reports"),
  });

  const reports = data?.reports ?? [];

  const filtered = filterByArchive(
    reports.filter(
      (report) =>
        (!controls.status || report.status === controls.status) &&
        matchesSearch(
          controls.search,
          report.title,
          report.workDone,
          report.materials,
          report.request?.reference,
          report.ticket?.reference,
          report.technician?.fullName,
        ),
    ),
    controls.archive,
    (report) => report.status === "APPROVED",
  );

  const pageData = paginate(filtered, controls.page, controls.pageSize);

  return (
    <DashboardShell
      nav={nav}
      title={t("reports.title")}
      subtitle={t("reports.text")}
    >
      <ListToolbar>
        <SearchField
          value={controls.search}
          onChange={controls.setSearch}
          placeholder={t("list.searchReports")}
        />
        <FilterSelect
          value={controls.status}
          onChange={controls.setStatus}
          options={reportStatuses.map((value) => ({
            value,
            label: t(`status.${value}` as "status.SUBMITTED"),
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
          <EmptyState title={t("reports.noReports")} />
        </div>
      )}

      {pageData.total > 0 && (
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {pageData.items.map((report) => (
            <Panel key={report.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent-sky text-ink">
                    <FileText className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">{report.title}</p>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {report.request?.reference || report.ticket?.reference} ·{" "}
                      {formatDate(report.createdAt)}
                    </p>
                  </div>
                </div>
                <StatusBadge status={report.status} />
              </div>

              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-ink-muted">
                {report.workDone}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-base-200/70 p-2.5">
                  <p className="text-ink-muted">{t("reports.hours")}</p>
                  <p className="mt-0.5 font-medium">{Number(report.hours)} h</p>
                </div>
                <div className="rounded-lg bg-base-200/70 p-2.5">
                  <p className="text-ink-muted">{t("reports.technician")}</p>
                  <p className="mt-0.5 flex items-center gap-1 font-semibold">
                    <UserRound className="h-3.5 w-3.5" />
                    {report.technician?.fullName || "–"}
                  </p>
                </div>
              </div>

              {report.materials && (
                <p className="mt-2 text-xs text-ink-muted">
                  <span className="font-semibold">
                    {t("reports.materials")}:
                  </span>{" "}
                  {report.materials}
                </p>
              )}

              {report.fileUrl && (
                <Button
                  onClick={() =>
                    void downloadFile(
                      `/reports/${report.id}/file`,
                      report.fileOriginalName || "service-report.pdf",
                    )
                  }
                  className={cn(
                    " border-current bg-transparent text-base-content hover:bg-base-content/10 h-6 px-2 text-xs mt-3",
                  )}
                >
                  <Download className="h-3.5 w-3.5" /> {t("reports.download")}
                </Button>
              )}
            </Panel>
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
