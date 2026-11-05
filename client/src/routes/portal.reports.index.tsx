import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Download, FileText, UserRound } from "lucide-react";
import { api, downloadFile } from "../lib/api";
import type { ServiceReport } from "../lib/types";
import { useI18n } from "../i18n/I18nContext";
import { usePortalNav } from "../components/nav";
import { DashboardShell, Panel } from "../components/DashboardShell";
import { EmptyState, ErrorState, PageLoader, StatusBadge } from "../components/ui";

export const Route = createFileRoute("/portal/reports/")({
  component: ReportsPage,
});

function ReportsPage() {
  const { t, formatDate } = useI18n();
  const nav = usePortalNav();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["reports"],
    queryFn: () => api<{ reports: ServiceReport[] }>("/reports"),
  });

  const reports = data?.reports ?? [];

  return (
    <DashboardShell nav={nav} title={t("reports.title")} subtitle={t("reports.text")}>
      {isLoading && <PageLoader />}
      {isError && <ErrorState onRetry={() => void refetch()} />}
      {!isLoading && !isError && reports.length === 0 && (
        <EmptyState title={t("reports.noReports")} />
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {reports.map((report) => (
          <Panel key={report.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold">{report.title}</p>
                  <p className="mt-0.5 text-[11px] text-base-content/70">
                    {report.request?.reference || report.ticket?.reference} ·{" "}
                    {formatDate(report.createdAt)}
                  </p>
                </div>
              </div>
              <StatusBadge status={report.status} />
            </div>

            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-base-content/65">
              {report.workDone}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-base-200/70 p-2.5">
                <p className="text-base-content/70">{t("reports.hours")}</p>
                <p className="mt-0.5 font-bold">{Number(report.hours)} h</p>
              </div>
              <div className="rounded-lg bg-base-200/70 p-2.5">
                <p className="text-base-content/70">{t("reports.technician")}</p>
                <p className="mt-0.5 flex items-center gap-1 font-semibold">
                  <UserRound className="h-3.5 w-3.5" />
                  {report.technician?.fullName || "–"}
                </p>
              </div>
            </div>

            {report.materials && (
              <p className="mt-2 text-xs text-base-content/65">
                <span className="font-semibold">{t("reports.materials")}:</span> {report.materials}
              </p>
            )}

            {report.fileUrl && (
              <button
                onClick={() =>
                  void downloadFile(
                    `/reports/${report.id}/file`,
                    report.fileOriginalName || "service-report.pdf",
                  )
                }
                className="btn btn-outline btn-xs mt-3"
              >
                <Download className="h-3.5 w-3.5" /> {t("reports.download")}
              </button>
            )}
          </Panel>
        ))}
      </div>
    </DashboardShell>
  );
}
