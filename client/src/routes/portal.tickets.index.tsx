import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, LifeBuoy, Loader2, Plus, X } from "lucide-react";
import { api, errorMessage } from "../lib/api";
import type { ServiceRequest, Ticket } from "../lib/types";
import { useI18n } from "../i18n/I18nContext";
import { usePortalNav } from "../components/nav";
import { DashboardShell } from "../components/DashboardShell";
import { EmptyState, ErrorState, PageLoader, StatusBadge } from "../components/ui";

export const Route = createFileRoute("/portal/tickets/")({
  component: TicketsPage,
});

function TicketsPage() {
  const { t, pick, formatDate } = useI18n();
  const nav = usePortalNav();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    category: "",
    priority: "MEDIUM",
    description: "",
    requestId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const ticketsQuery = useQuery({
    queryKey: ["tickets"],
    queryFn: () => api<{ tickets: Ticket[] }>("/tickets"),
  });
  const requestsQuery = useQuery({
    queryKey: ["requests"],
    queryFn: () => api<{ requests: ServiceRequest[] }>("/requests"),
  });

  const tickets = ticketsQuery.data?.tickets ?? [];

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api("/tickets", {
        method: "POST",
        body: { ...form, requestId: form.requestId || undefined },
      });
      setShowForm(false);
      setForm({ subject: "", category: "", priority: "MEDIUM", description: "", requestId: "" });
      await queryClient.invalidateQueries({ queryKey: ["tickets"] });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
    } catch (caught) {
      setError(errorMessage(caught, t("common.error")));
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardShell
      nav={nav}
      title={t("tickets.title")}
      subtitle={t("tickets.text")}
      actions={
        <button onClick={() => setShowForm((value) => !value)} className="btn btn-primary btn-sm">
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {t("tickets.new")}
        </button>
      }
    >
      {showForm && (
        <form onSubmit={submit} className="mb-5 rounded-box border border-base-300 bg-base-100 p-5">
          <h2 className="text-base font-bold">{t("tickets.new")}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-semibold">{t("tickets.subject")}</span>
              <input
                required
                minLength={4}
                value={form.subject}
                onChange={(event) => setForm({ ...form, subject: event.target.value })}
                className="input input-bordered w-full"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">{t("tickets.category")}</span>
              <input
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
                className="input input-bordered w-full"
                placeholder={pick("Network, billing…", "Netzwerk, Rechnung…")}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">{t("tickets.priority")}</span>
              <select
                value={form.priority}
                onChange={(event) => setForm({ ...form, priority: event.target.value })}
                className="select select-bordered w-full"
              >
                {["LOW", "MEDIUM", "HIGH", "URGENT"].map((priority) => (
                  <option key={priority} value={priority}>
                    {t(`priority.${priority}` as "priority.LOW")}
                  </option>
                ))}
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-semibold">
                {t("requests.details")} ({t("common.optional")})
              </span>
              <select
                value={form.requestId}
                onChange={(event) => setForm({ ...form, requestId: event.target.value })}
                className="select select-bordered w-full"
              >
                <option value="">–</option>
                {(requestsQuery.data?.requests ?? []).map((request) => (
                  <option key={request.id} value={request.id}>
                    {request.reference} — {request.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-semibold">{t("tickets.description")}</span>
              <textarea
                required
                minLength={10}
                rows={4}
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                className="textarea textarea-bordered w-full"
              />
            </label>
          </div>
          {error && <p className="mt-3 text-xs text-error">{error}</p>}
          <button disabled={loading} className="btn btn-primary mt-4">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("tickets.create")}
          </button>
        </form>
      )}

      {ticketsQuery.isLoading && <PageLoader />}
      {ticketsQuery.isError && <ErrorState onRetry={() => void ticketsQuery.refetch()} />}
      {!ticketsQuery.isLoading && !ticketsQuery.isError && tickets.length === 0 && (
        <EmptyState
          title={t("tickets.noTickets")}
          text={t("tickets.text")}
          action={
            <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm">
              {t("tickets.new")}
            </button>
          }
        />
      )}

      <div className="space-y-3">
        {tickets.map((ticket) => (
          <Link
            key={ticket.id}
            to="/portal/tickets/$id"
            params={{ id: ticket.id }}
            className="flex flex-wrap items-center gap-4 rounded-box border border-base-300 bg-base-100 p-4 transition hover:border-primary/30 hover:bg-primary/5"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
              <LifeBuoy className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{ticket.subject}</p>
              <p className="text-[11px] text-base-content/70">
                {ticket.reference} · {formatDate(ticket.createdAt)}
                {ticket.technician ? ` · ${ticket.technician.fullName}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="badge badge-outline badge-xs">
                {t(`priority.${ticket.priority}` as "priority.LOW")}
              </span>
              <StatusBadge status={ticket.status} />
              <ArrowRight className="h-4 w-4 text-base-content/65" />
            </div>
          </Link>
        ))}
      </div>
    </DashboardShell>
  );
}
