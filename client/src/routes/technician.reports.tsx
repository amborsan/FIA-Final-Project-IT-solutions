import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Alert } from "@/components/ui/alert";
import { NativeSelect } from "@/components/ui/native-select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, FileText, Loader2, Plus, X } from "lucide-react";
import { api, downloadFile, errorMessage } from "../lib/api";
import type { ServiceReport, ServiceRequest, Ticket } from "../lib/types";
import { useI18n } from "../i18n/I18nContext";
import { useTechnicianNav } from "../components/nav";
import { Panel } from "../components/DashboardShell";
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

export const Route = createFileRoute("/technician/reports")({
  validateSearch: (search: Record<string, unknown>) => ({
    request: typeof search.request === "string" ? search.request : undefined,
  }),
  component: TechnicianReportsPage,
});

const reportStatuses = ["SUBMITTED", "APPROVED"];

function TechnicianReportsPage() {
  const { request: preselectedRequest } = Route.useSearch();
  const { t, formatDate } = useI18n();
  const nav = useTechnicianNav();
  const queryClient = useQueryClient();
  const controls = useListControls(6);
  const [showForm, setShowForm] = useState(!!preselectedRequest);
  const [form, setForm] = useState({
    requestId: preselectedRequest ?? "",
    ticketId: "",
    title: "",
    workDone: "",
    hours: "1",
    materials: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const reportsQuery = useQuery({
    queryKey: ["reports"],
    queryFn: () => api<{ reports: ServiceReport[] }>("/reports"),
  });
  const requestsQuery = useQuery({
    queryKey: ["requests"],
    queryFn: () => api<{ requests: ServiceRequest[] }>("/requests"),
  });
  const ticketsQuery = useQuery({
    queryKey: ["tickets"],
    queryFn: () => api<{ tickets: Ticket[] }>("/tickets"),
  });

  const reports = reportsQuery.data?.reports ?? [];

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
        ),
    ),
    controls.archive,
    (report) => report.status === "APPROVED",
  );

  const pageData = paginate(filtered, controls.page, controls.pageSize);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.requestId && !form.ticketId) {
      setError(t("technician.chooseTask"));
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const body = new FormData();
      body.append("requestId", form.requestId);
      body.append("ticketId", form.ticketId);
      body.append("title", form.title);
      body.append("workDone", form.workDone);
      body.append("hours", form.hours);
      body.append("materials", form.materials);
      if (file) body.append("file", file);

      await api("/reports", { method: "POST", body });
      setMessage(t("technician.reportSaved"));
      setForm({
        requestId: "",
        ticketId: "",
        title: "",
        workDone: "",
        hours: "1",
        materials: "",
      });
      setFile(null);
      setShowForm(false);
      await queryClient.invalidateQueries({ queryKey: ["reports"] });
    } catch (caught) {
      setError(errorMessage(caught, t("technician.reportError")));
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardShell
      nav={nav}
      title={t("technician.reports")}
      subtitle={t("reports.text")}
      actions={
        <Button
          onClick={() => setShowForm((value) => !value)}
          className={cn(
            " bg-primary text-primary-content border-primary hover:bg-primary-hover h-8 px-3 text-sm",
          )}
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {t("technician.newReport")}
        </Button>
      }
    >
      {message && (
        <Alert
          className={cn(
            "flex flex-col items-start gap-4 rounded-box border border-base-300 bg-base-200 p-4 sm:flex-row sm:items-center bg-success text-success-content border-success mb-4 text-sm",
          )}
        >
          {message}
        </Alert>
      )}
      {error && (
        <Alert
          className={cn(
            "flex flex-col items-start gap-4 rounded-box border border-base-300 bg-base-200 p-4 sm:flex-row sm:items-center bg-error text-error-content border-error mb-4 text-sm",
          )}
        >
          {error}
        </Alert>
      )}

      {showForm && (
        <form
          onSubmit={submit}
          className="mb-5 rounded-box border border-base-300 bg-base-100 p-6"
        >
          <h2 className="text-base font-medium">{t("technician.addReport")}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">
                {t("technician.chooseTask")}
              </span>
              <NativeSelect
                value={form.requestId}
                onChange={(event) =>
                  setForm({
                    ...form,
                    requestId: event.target.value,
                    ticketId: "",
                  })
                }
                className={cn(" w-full")}
              >
                <option value="">{t("technician.assignedRequests")}</option>
                {(requestsQuery.data?.requests ?? []).map((request) => (
                  <option key={request.id} value={request.id}>
                    {request.reference} — {request.title}
                  </option>
                ))}
              </NativeSelect>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">
                {t("tickets.title")}
              </span>
              <NativeSelect
                value={form.ticketId}
                onChange={(event) =>
                  setForm({
                    ...form,
                    ticketId: event.target.value,
                    requestId: "",
                  })
                }
                className={cn(" w-full")}
              >
                <option value="">{t("technician.assignedTickets")}</option>
                {(ticketsQuery.data?.tickets ?? []).map((ticket) => (
                  <option key={ticket.id} value={ticket.id}>
                    {ticket.reference} — {ticket.subject}
                  </option>
                ))}
              </NativeSelect>
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-semibold">
                {t("technician.reportTitle")}
              </span>
              <Input
                required
                minLength={3}
                value={form.title}
                onChange={(event) =>
                  setForm({ ...form, title: event.target.value })
                }
                className={cn(" w-full")}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-semibold">
                {t("technician.workDone")}
              </span>
              <Textarea
                required
                minLength={10}
                rows={4}
                value={form.workDone}
                onChange={(event) =>
                  setForm({ ...form, workDone: event.target.value })
                }
                className={cn(" w-full")}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">
                {t("technician.hours")}
              </span>
              <Input
                required
                type="number"
                min={0.25}
                step={0.25}
                value={form.hours}
                onChange={(event) =>
                  setForm({ ...form, hours: event.target.value })
                }
                className={cn(" w-full")}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">
                {t("technician.materials")}
              </span>
              <Input
                value={form.materials}
                onChange={(event) =>
                  setForm({ ...form, materials: event.target.value })
                }
                className={cn(" w-full")}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-semibold">
                {t("technician.attachFile")}
              </span>
              <Input
                type="file"
                accept="application/pdf,image/png,image/jpeg"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                className={cn(" w-full")}
              />
            </label>
          </div>
          <Button
            disabled={loading}
            className={cn(
              " bg-primary text-primary-content border-primary hover:bg-primary-hover mt-4",
            )}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("technician.submitReport")}
          </Button>
        </form>
      )}

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

      {reportsQuery.isLoading && <PageLoader />}
      {reportsQuery.isError && (
        <ErrorState onRetry={() => void reportsQuery.refetch()} />
      )}
      {!reportsQuery.isLoading &&
        !reportsQuery.isError &&
        pageData.total === 0 && (
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
                    <p className="text-xs text-ink-muted">
                      {report.request?.reference || report.ticket?.reference} ·{" "}
                      {formatDate(report.createdAt)}
                    </p>
                  </div>
                </div>
                <StatusBadge status={report.status} />
              </div>
              <p className="mt-3 text-xs leading-relaxed text-ink-muted">
                {report.workDone}
              </p>
              <p className="mt-2 text-xs text-ink-muted">
                {t("technician.hours")}:{" "}
                <strong>{Number(report.hours)} h</strong>
              </p>
              {report.fileUrl && (
                <Button
                  onClick={() =>
                    void downloadFile(
                      `/reports/${report.id}/file`,
                      report.fileOriginalName || "report.pdf",
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
