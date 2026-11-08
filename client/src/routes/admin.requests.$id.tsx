import { useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Plus, Send, Trash2, UserPlus } from "lucide-react";
import { api, errorMessage } from "../lib/api";
import type { ServiceRequest, User } from "../lib/types";
import { useI18n } from "../i18n/I18nContext";
import { useAdminNav } from "../components/nav";
import { DashboardShell, Panel } from "../components/DashboardShell";
import { ErrorState, PageLoader, StatusBadge } from "../components/ui";

export const Route = createFileRoute("/admin/requests/$id")({
  component: AdminRequestDetailPage,
});

const statuses = ["NEW", "REVIEWING", "QUOTED", "APPROVED", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

function AdminRequestDetailPage() {
  const { id } = useParams({ from: "/admin/requests/$id" });
  const { t, pick, formatDate, formatMoney } = useI18n();
  const nav = useAdminNav();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["request", id],
    queryFn: () => api<{ request: ServiceRequest }>(`/requests/${id}`),
  });
  const techniciansQuery = useQuery({
    queryKey: ["admin", "users", "TECHNICIAN"],
    queryFn: () => api<{ users: User[] }>("/admin/users?role=TECHNICIAN"),
  });
  const customersQuery = useQuery({
    queryKey: ["admin", "users", "CUSTOMER"],
    queryFn: () => api<{ users: User[] }>("/admin/users?role=CUSTOMER"),
  });

  const request = data?.request;
  const [techId, setTechId] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [quoteForm, setQuoteForm] = useState({
    validUntil: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    taxRate: "19",
    notes: "",
    items: [{ description: "", quantity: "1", unitPrice: "" }],
  });

  const currentTech = techId ?? request?.assignedTechnicianId ?? "";
  const currentCustomer = customerId ?? request?.customerId ?? "";
  const currentStatus = status || request?.status || "NEW";

  const subtotal = quoteForm.items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
    0,
  );
  const tax = Math.round(subtotal * (Number(quoteForm.taxRate) || 0)) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  async function saveAssignment() {
    setBusy("assign");
    setMessage("");
    setError("");
    try {
      await api(`/requests/${id}/assign`, {
        method: "PATCH",
        body: {
          technicianId: currentTech || null,
          customerId: currentCustomer || null,
        },
      });
      setMessage(t("admin.userUpdated"));
      setTechId(null);
      setCustomerId(null);
      await queryClient.invalidateQueries({ queryKey: ["request", id] });
      await queryClient.invalidateQueries({ queryKey: ["requests"] });
    } catch (caught) {
      setError(errorMessage(caught, t("common.error")));
    } finally {
      setBusy("");
    }
  }

  async function saveStatus() {
    setBusy("status");
    setMessage("");
    setError("");
    try {
      await api(`/requests/${id}/status`, { method: "PATCH", body: { status: currentStatus } });
      setMessage(t("requests.statusUpdated"));
      await queryClient.invalidateQueries({ queryKey: ["request", id] });
      await queryClient.invalidateQueries({ queryKey: ["requests"] });
    } catch (caught) {
      setError(errorMessage(caught, t("common.error")));
    } finally {
      setBusy("");
    }
  }

  async function createQuote(event: React.FormEvent) {
    event.preventDefault();
    setBusy("quote");
    setMessage("");
    setError("");
    try {
      await api("/quotes", {
        method: "POST",
        body: {
          requestId: id,
          validUntil: new Date(quoteForm.validUntil).toISOString(),
          taxRate: Number(quoteForm.taxRate),
          notes: quoteForm.notes,
          items: quoteForm.items.map((item) => ({
            description: item.description,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
          })),
        },
      });
      setMessage(t("admin.quoteCreated"));
      setQuoteForm({
        validUntil: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
        taxRate: "19",
        notes: "",
        items: [{ description: "", quantity: "1", unitPrice: "" }],
      });
      await queryClient.invalidateQueries({ queryKey: ["request", id] });
      await queryClient.invalidateQueries({ queryKey: ["requests"] });
    } catch (caught) {
      setError(errorMessage(caught, t("admin.quoteError")));
    } finally {
      setBusy("");
    }
  }

  async function sendQuote(quoteId: string) {
    setBusy(quoteId);
    setError("");
    try {
      await api(`/quotes/${quoteId}/send`, { method: "POST" });
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
      <DashboardShell nav={nav} title={t("admin.requestDetails")}>
        <PageLoader />
      </DashboardShell>
    );
  }
  if (isError || !request) {
    return (
      <DashboardShell nav={nav} title={t("admin.requestDetails")}>
        <ErrorState />
        <Link to="/admin/requests" className="ds-btn ds-btn-outline ds-btn-sm mt-4">
          <ArrowLeft className="h-4 w-4" /> {t("common.back")}
        </Link>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      nav={nav}
      title={request.title}
      subtitle={`${request.reference} · ${formatDate(request.createdAt)}`}
      actions={
        <Link to="/admin/requests" className="ds-btn ds-btn-ghost ds-btn-sm">
          <ArrowLeft className="h-4 w-4" /> {t("common.back")}
        </Link>
      }
    >
      {message && <div role="status" className="ds-alert ds-alert-success mb-4 text-sm">{message}</div>}
      {error && <div role="alert" className="ds-alert ds-alert-error mb-4 text-sm">{error}</div>}

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <Panel title={t("admin.requestDetails")} action={<StatusBadge status={request.status} />}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Info label={t("common.customer")} value={request.customer?.fullName || request.contactName} />
              <Info label={t("common.email")} value={request.contactEmail} />
              <Info label={t("common.phone")} value={request.contactPhone || "–"} />
              <Info label={t("common.service")} value={request.service ? pick(request.service.nameEn, request.service.nameDe) : "–"} />
              <Info label={t("requests.preferredDate")} value={formatDate(request.preferredDate)} />
              <Info label={t("requests.budget")} value={request.budget ? formatMoney(request.budget) : "–"} />
              <Info label={t("requests.siteAddress")} value={request.siteAddress || "–"} className="sm:col-span-2" />
            </div>
            <div className="mt-4 border-t border-base-200 pt-4">
              <p className="text-[11px] uppercase tracking-wide text-base-content/70">{t("common.description")}</p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-base-content/70">
                {request.description}
              </p>
            </div>
            {request.customerId ? (
              <p className="mt-3 rounded-lg bg-success/10 px-2.5 py-2 text-[11px] text-success">
                Linked customer account: {request.customer?.email}
              </p>
            ) : (
              <p className="mt-3 rounded-lg bg-warning/10 px-2.5 py-2 text-[11px] text-warning">
                This is a lead. Link it to a customer account before creating a quote.
              </p>
            )}
          </Panel>

          <Panel title={t("requests.quotes")}>
            {(request.quotes ?? []).length === 0 && (
              <p className="py-3 text-center text-xs text-base-content/70">{t("admin.noQuotes")}</p>
            )}
            <div className="space-y-3">
              {(request.quotes ?? []).map((quote) => (
                <div key={quote.id} className="rounded-lg border border-base-300 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-mono text-xs font-semibold">{quote.reference}</p>
                      <p className="text-[11px] text-base-content/70">
                        {t("admin.validUntil")}: {formatDate(quote.validUntil)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={quote.status} />
                      <span className="text-sm font-bold">{formatMoney(quote.total)}</span>
                      {quote.status === "DRAFT" && (
                        <button
                          onClick={() => void sendQuote(quote.id)}
                          disabled={busy === quote.id}
                          className="ds-btn ds-btn-primary ds-btn-xs"
                        >
                          {busy === quote.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Send className="h-3.5 w-3.5" />
                          )}
                          {t("admin.sendQuote")}
                        </button>
                      )}
                    </div>
                  </div>
                  <ul className="mt-2 space-y-1 text-[11px] text-base-content/65">
                    {quote.items.map((item) => (
                      <li key={item.id} className="flex justify-between gap-2">
                        <span>
                          {item.quantity} × {item.description}
                        </span>
                        <span>{formatMoney(item.total)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Panel>

          {request.customerId && (
            <Panel title={t("admin.createQuote")}>
              <form onSubmit={createQuote} className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold">{t("admin.validUntil")}</span>
                    <input
                      required
                      type="date"
                      value={quoteForm.validUntil}
                      onChange={(event) => setQuoteForm({ ...quoteForm, validUntil: event.target.value })}
                      className="ds-input ds-input-bordered ds-input-sm w-full"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold">{t("admin.taxRate")}</span>
                    <input
                      required
                      type="number"
                      min={0}
                      max={100}
                      value={quoteForm.taxRate}
                      onChange={(event) => setQuoteForm({ ...quoteForm, taxRate: event.target.value })}
                      className="ds-input ds-input-bordered ds-input-sm w-full"
                    />
                  </label>
                </div>

                <div className="space-y-2">
                  {quoteForm.items.map((item, index) => (
                    <div key={index} className="grid gap-2 sm:grid-cols-[1fr_70px_100px_36px]">
                      <input
                        required
                        placeholder={t("common.description")}
                        value={item.description}
                        onChange={(event) => {
                          const items = [...quoteForm.items];
                          items[index] = { ...item, description: event.target.value };
                          setQuoteForm({ ...quoteForm, items });
                        }}
                        className="ds-input ds-input-bordered ds-input-sm w-full"
                      />
                      <input
                        required
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(event) => {
                          const items = [...quoteForm.items];
                          items[index] = { ...item, quantity: event.target.value };
                          setQuoteForm({ ...quoteForm, items });
                        }}
                        className="ds-input ds-input-bordered ds-input-sm w-full"
                      />
                      <input
                        required
                        type="number"
                        min={0}
                        step={0.01}
                        placeholder="0.00"
                        value={item.unitPrice}
                        onChange={(event) => {
                          const items = [...quoteForm.items];
                          items[index] = { ...item, unitPrice: event.target.value };
                          setQuoteForm({ ...quoteForm, items });
                        }}
                        className="ds-input ds-input-bordered ds-input-sm w-full"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setQuoteForm({
                            ...quoteForm,
                            items: quoteForm.items.filter((_, itemIndex) => itemIndex !== index),
                          })
                        }
                        disabled={quoteForm.items.length === 1}
                        className="ds-btn ds-btn-ghost ds-btn-sm text-error"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setQuoteForm({
                      ...quoteForm,
                      items: [...quoteForm.items, { description: "", quantity: "1", unitPrice: "" }],
                    })
                  }
                  className="ds-btn ds-btn-outline ds-btn-xs"
                >
                  <Plus className="h-3.5 w-3.5" /> {t("admin.addItem")}
                </button>

                <textarea
                  rows={2}
                  placeholder={t("admin.quoteNotes")}
                  value={quoteForm.notes}
                  onChange={(event) => setQuoteForm({ ...quoteForm, notes: event.target.value })}
                  className="ds-textarea ds-textarea-bordered w-full text-sm"
                />

                <div className="flex items-center justify-between rounded-lg bg-base-200 px-3 py-2 text-sm">
                  <span>{t("common.total")}</span>
                  <strong>{formatMoney(total)}</strong>
                </div>

                <button disabled={busy === "quote"} className="ds-btn ds-btn-primary ds-btn-sm">
                  {busy === "quote" && <Loader2 className="h-4 w-4 animate-spin" />}
                  {t("admin.createQuote")}
                </button>
              </form>
            </Panel>
          )}
        </div>

        <div className="space-y-5">
          <Panel title={t("admin.assignment")}>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">{t("admin.assignTechnician")}</span>
              <select
                value={currentTech}
                onChange={(event) => setTechId(event.target.value)}
                className="ds-select ds-select-bordered ds-select-sm w-full"
              >
                <option value="">{t("common.unassigned")}</option>
                {(techniciansQuery.data?.users ?? []).map((technician) => (
                  <option key={technician.id} value={technician.id}>
                    {technician.fullName}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-3 block">
              <span className="mb-1 block text-xs font-semibold">{t("admin.linkCustomer")}</span>
              <select
                value={currentCustomer}
                onChange={(event) => setCustomerId(event.target.value)}
                className="ds-select ds-select-bordered ds-select-sm w-full"
              >
                <option value="">–</option>
                {(customersQuery.data?.users ?? []).map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.fullName} ({customer.email})
                  </option>
                ))}
              </select>
            </label>
            <button
              onClick={saveAssignment}
              disabled={busy === "assign"}
              className="ds-btn ds-btn-primary ds-btn-sm mt-3 w-full"
            >
              {busy === "assign" ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              {t("admin.assign")}
            </button>
          </Panel>

          <Panel title={t("common.status")}>
            <select
              value={currentStatus}
              onChange={(event) => setStatus(event.target.value)}
              className="ds-select ds-select-bordered ds-select-sm w-full"
            >
              {statuses.map((value) => (
                <option key={value} value={value}>
                  {t(`status.${value}` as "status.NEW")}
                </option>
              ))}
            </select>
            <button
              onClick={saveStatus}
              disabled={busy === "status"}
              className="ds-btn ds-btn-primary ds-btn-sm mt-3 w-full"
            >
              {busy === "status" && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("common.update")}
            </button>
          </Panel>

          <Panel title={t("requests.reports")}>
            {(request.reports ?? []).length === 0 ? (
              <p className="py-3 text-center text-xs text-base-content/70">{t("requests.noReports")}</p>
            ) : (
              <div className="space-y-2">
                {(request.reports ?? []).map((report) => (
                  <div key={report.id} className="rounded-lg border border-base-300 p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold">{report.title}</p>
                      <StatusBadge status={report.status} />
                    </div>
                    <p className="mt-1 text-[11px] text-base-content/65">
                      {report.technician?.fullName} · {Number(report.hours)} h
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </DashboardShell>
  );
}

function Info({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-[11px] uppercase tracking-wide text-base-content/70">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
