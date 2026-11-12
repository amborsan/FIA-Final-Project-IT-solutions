import { cn } from "@/lib/utils";
import { Alert } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  MapPin,
  XCircle,
} from "lucide-react";
import { api, downloadFile, errorMessage } from "../lib/api";
import type { ServiceRequest } from "../lib/types";
import { useI18n } from "../i18n/I18nContext";
import { usePortalNav } from "../components/nav";
import { Panel } from "../components/DashboardShell";
import { CustomerPortalShell as DashboardShell } from "../components/CustomerPortalShell";
import { ErrorState, PageLoader, StatusBadge } from "../components/ui";

export const Route = createFileRoute("/portal/requests/$id")({
  component: RequestDetailPage,
});

function RequestDetailPage() {
  const { id } = useParams({ from: "/portal/requests/$id" });
  const { t, pick, formatDate, formatDateTime, formatMoney } = useI18n();
  const nav = usePortalNav();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["request", id],
    queryFn: () => api<{ request: ServiceRequest }>(`/requests/${id}`),
  });

  async function quoteAction(quoteId: string, action: "accept" | "reject") {
    setBusy(quoteId + action);
    setError("");
    setMessage("");
    try {
      await api(`/quotes/${quoteId}/${action}`, { method: "POST" });
      setMessage(
        action === "accept"
          ? t("requests.quoteAccepted")
          : t("requests.quoteRejected"),
      );
      await queryClient.invalidateQueries({ queryKey: ["request", id] });
      await queryClient.invalidateQueries({ queryKey: ["requests"] });
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
    } catch (caught) {
      setError(errorMessage(caught, t("common.error")));
    } finally {
      setBusy("");
    }
  }

  async function cancelRequest() {
    if (!window.confirm(t("requests.cancelConfirm"))) return;
    setBusy("cancel");
    try {
      await api(`/requests/${id}/cancel`, { method: "POST" });
      await queryClient.invalidateQueries({ queryKey: ["request", id] });
      await queryClient.invalidateQueries({ queryKey: ["requests"] });
    } catch (caught) {
      setError(errorMessage(caught, t("common.error")));
    } finally {
      setBusy("");
    }
  }

  if (isLoading) {
    return (
      <DashboardShell nav={nav} title={t("requests.details")}>
        <PageLoader />
      </DashboardShell>
    );
  }

  if (isError || !data) {
    return (
      <DashboardShell nav={nav} title={t("requests.details")}>
        <ErrorState message={t("requests.notFound")} />
        <Link
          to="/portal/requests"
          className={cn(
            buttonVariants(),
            " border-current bg-transparent text-base-content hover:bg-base-content/10 h-8 px-3 text-sm mt-4",
          )}
        >
          <ArrowLeft className="h-4 w-4" /> {t("requests.back")}
        </Link>
      </DashboardShell>
    );
  }

  const request = data.request;
  const quotes = request.quotes ?? [];
  const reports = request.reports ?? [];
  const appointments = request.appointments ?? [];

  return (
    <DashboardShell
      nav={nav}
      title={request.title}
      subtitle={`${request.reference} · ${formatDate(request.createdAt)}`}
      actions={
        <Link
          to="/portal/requests"
          className={cn(
            buttonVariants(),
            " border-transparent bg-transparent text-base-content hover:bg-base-content/10 h-8 px-3 text-sm",
          )}
        >
          <ArrowLeft className="h-4 w-4" /> {t("common.back")}
        </Link>
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

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-8">
          <Panel
            title={t("requests.details")}
            action={<StatusBadge status={request.status} />}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-ink-muted">
                  {t("requests.service")}
                </p>
                <p className="text-sm font-medium">
                  {request.service
                    ? pick(request.service.nameEn, request.service.nameDe)
                    : "–"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-ink-muted">
                  {t("requests.assignedTo")}
                </p>
                <p className="text-sm font-medium">
                  {request.technician?.fullName ?? t("requests.unassigned")}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-ink-muted">
                  {t("requests.preferredDate")}
                </p>
                <p className="text-sm font-medium">
                  {formatDate(request.preferredDate)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-ink-muted">
                  {t("requests.budget")}
                </p>
                <p className="text-sm font-medium">
                  {request.budget ? formatMoney(request.budget) : "–"}
                </p>
              </div>
              {request.siteAddress && (
                <div className="sm:col-span-2">
                  <p className="text-xs uppercase tracking-wide text-ink-muted">
                    {t("requests.siteAddress")}
                  </p>
                  <p className="flex items-center gap-1.5 text-sm">
                    <MapPin className="h-4 w-4 text-primary" />{" "}
                    {request.siteAddress}
                  </p>
                </div>
              )}
            </div>
            <div className="mt-4 border-t border-hairline pt-4">
              <p className="text-xs uppercase tracking-wide text-ink-muted">
                {t("requests.description")}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink-muted">
                {request.description}
              </p>
            </div>
            {["NEW", "REVIEWING", "QUOTED"].includes(request.status) && (
              <Button
                onClick={cancelRequest}
                disabled={busy === "cancel"}
                className={cn(
                  " border-transparent bg-transparent text-base-content hover:bg-base-content/10 h-6 px-2 text-xs mt-4 text-error",
                )}
              >
                {busy === "cancel" && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                )}
                {t("requests.cancelRequest")}
              </Button>
            )}
          </Panel>

          <Panel title={t("requests.quotes")}>
            {quotes.length === 0 && (
              <p className="py-4 text-center text-sm text-ink-muted">
                {t("requests.noQuotes")}
              </p>
            )}
            <div className="space-y-4">
              {quotes.map((quote) => (
                <div
                  key={quote.id}
                  className="rounded-box border border-base-300 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="tabular-nums text-xs font-semibold">
                        {quote.reference}
                      </p>
                      <p className="text-xs text-ink-muted">
                        {t("requests.quoteValidUntil")}:{" "}
                        {formatDate(quote.validUntil)}
                      </p>
                    </div>
                    <StatusBadge status={quote.status} />
                  </div>

                  <div className="mt-3 overflow-x-auto">
                    <Table
                      className={cn(
                        " text-xs [&_td]:px-2 [&_td]:py-1 [&_th]:px-2 [&_th]:py-1",
                      )}
                    >
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("common.description")}</TableHead>
                          <TableHead className="text-right">
                            {t("common.quantity")}
                          </TableHead>
                          <TableHead className="text-right">
                            {t("common.price")}
                          </TableHead>
                          <TableHead className="text-right">
                            {t("common.total")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {quote.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.description}</TableCell>
                            <TableCell className="text-right">
                              {item.quantity}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatMoney(item.unitPrice)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatMoney(item.total)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="mt-3 ml-auto max-w-xs space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-ink-muted">
                        {t("common.subtotal")}
                      </span>
                      <span>{formatMoney(quote.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-muted">
                        {t("common.tax")} ({Number(quote.taxRate)} %)
                      </span>
                      <span>{formatMoney(quote.taxAmount)}</span>
                    </div>
                    <div className="flex justify-between border-t border-hairline pt-1 font-medium">
                      <span>{t("common.total")}</span>
                      <span>{formatMoney(quote.total)}</span>
                    </div>
                  </div>

                  {quote.notes && (
                    <p className="mt-3 rounded-lg bg-base-200 p-3 text-xs text-ink-muted">
                      {quote.notes}
                    </p>
                  )}

                  {quote.status === "SENT" && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        onClick={() => void quoteAction(quote.id, "accept")}
                        disabled={!!busy}
                        className={cn(
                          " bg-primary text-primary-content border-primary hover:bg-primary-hover h-8 px-3 text-sm",
                        )}
                      >
                        {busy === quote.id + "accept" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                        {t("requests.acceptQuote")}
                      </Button>
                      <Button
                        onClick={() => void quoteAction(quote.id, "reject")}
                        disabled={!!busy}
                        className={cn(
                          " border-transparent bg-transparent text-base-content hover:bg-base-content/10 h-8 px-3 text-sm text-error",
                        )}
                      >
                        <XCircle className="h-4 w-4" />
                        {t("requests.rejectQuote")}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Panel>

          <Panel title={t("requests.reports")}>
            {reports.length === 0 ? (
              <p className="py-4 text-center text-sm text-ink-muted">
                {t("requests.noReports")}
              </p>
            ) : (
              <div className="space-y-3">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="rounded-lg border border-base-300 p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold">{report.title}</p>
                      <StatusBadge status={report.status} />
                    </div>
                    <p className="mt-1 text-xs text-ink-muted">
                      {report.workDone}
                    </p>
                    <p className="mt-1 text-xs text-ink-muted">
                      {report.technician?.fullName} · {Number(report.hours)} h ·{" "}
                      {formatDate(report.createdAt)}
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
                          " border-current bg-transparent text-base-content hover:bg-base-content/10 h-6 px-2 text-xs mt-2",
                        )}
                      >
                        <Download className="h-3.5 w-3.5" />{" "}
                        {t("requests.downloadReport")}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>

        <div className="space-y-8">
          <Panel title={t("requests.appointments")}>
            {appointments.length === 0 ? (
              <p className="py-3 text-center text-xs text-ink-muted">
                {t("appointments.noAppointments")}
              </p>
            ) : (
              <div className="space-y-3">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="rounded-lg bg-base-200/60 p-3"
                  >
                    <p className="text-sm font-semibold">{appointment.title}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-muted">
                      <CalendarDays className="h-3.5 w-3.5" />{" "}
                      {formatDateTime(appointment.startsAt)}
                    </p>
                    {appointment.location && (
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-muted">
                        <MapPin className="h-3.5 w-3.5" />{" "}
                        {appointment.location}
                      </p>
                    )}
                    <div className="mt-2">
                      <StatusBadge status={appointment.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel title={t("requests.contact")}>
            <div className="space-y-1 text-sm">
              <p className="font-semibold">{request.contactName}</p>
              <p className="text-xs text-ink-muted">{request.contactEmail}</p>
              {request.contactPhone && (
                <p className="text-xs text-ink-muted">{request.contactPhone}</p>
              )}
            </div>
          </Panel>

          <Panel title={t("orders.invoice")}>
            <div className="flex items-start gap-2 text-xs text-ink-muted">
              <FileText className="h-4 w-4 shrink-0 text-primary" />
              <p>
                {pick(
                  "After accepting a quote, the order and invoice appear under Orders & invoices.",
                  "Nach Annahme eines Angebots erscheinen Bestellung und Rechnung unter Bestellungen & Rechnungen.",
                )}
              </p>
            </div>
            <Link
              to="/portal/orders"
              className={cn(
                buttonVariants(),
                " border-current bg-transparent text-base-content hover:bg-base-content/10 h-6 px-2 text-xs mt-3",
              )}
            >
              {t("portal.orders")}
            </Link>
          </Panel>
        </div>
      </div>
    </DashboardShell>
  );
}
