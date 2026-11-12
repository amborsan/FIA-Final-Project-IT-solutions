import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, LifeBuoy, Loader2, Plus, X } from "lucide-react";
import { api, errorMessage } from "../lib/api";
import type { ServiceRequest, Ticket } from "../lib/types";
import { useI18n } from "../i18n/I18nContext";
import { usePortalNav } from "../components/nav";
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

export const Route = createFileRoute("/portal/tickets/")({
  component: TicketsPage,
});

const ticketStatuses = [
  "OPEN",
  "IN_PROGRESS",
  "WAITING_CUSTOMER",
  "RESOLVED",
  "CLOSED",
];
const priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const archivedStatuses = new Set(["RESOLVED", "CLOSED"]);

function TicketsPage() {
  const { t, pick, formatDate } = useI18n();
  const nav = usePortalNav();
  const queryClient = useQueryClient();
  const controls = useListControls();
  const [priority, setPriority] = useState("");
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

  const filtered = filterByArchive(
    tickets.filter(
      (ticket) =>
        (!controls.status || ticket.status === controls.status) &&
        (!priority || ticket.priority === priority) &&
        matchesSearch(
          controls.search,
          ticket.reference,
          ticket.subject,
          ticket.description,
          ticket.technician?.fullName,
        ),
    ),
    controls.archive,
    (ticket) => archivedStatuses.has(ticket.status),
  );

  const pageData = paginate(filtered, controls.page, controls.pageSize);

  function changePriority(value: string) {
    setPriority(value);
    controls.setPage(1);
  }

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
      setForm({
        subject: "",
        category: "",
        priority: "MEDIUM",
        description: "",
        requestId: "",
      });
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
        <Button
          onClick={() => setShowForm((value) => !value)}
          className={cn(
            " bg-primary text-primary-content border-primary hover:bg-primary-hover h-8 px-3 text-sm",
          )}
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {t("tickets.new")}
        </Button>
      }
    >
      {showForm && (
        <form
          onSubmit={submit}
          className="mb-5 rounded-box border border-base-300 bg-base-100 p-6"
        >
          <h2 className="text-base font-medium">{t("tickets.new")}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-semibold">
                {t("tickets.subject")}
              </span>
              <Input
                required
                minLength={4}
                value={form.subject}
                onChange={(event) =>
                  setForm({ ...form, subject: event.target.value })
                }
                className={cn(" w-full")}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">
                {t("tickets.category")}
              </span>
              <Input
                value={form.category}
                onChange={(event) =>
                  setForm({ ...form, category: event.target.value })
                }
                className={cn(" w-full")}
                placeholder={pick("Network, billing…", "Netzwerk, Rechnung…")}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">
                {t("tickets.priority")}
              </span>
              <NativeSelect
                value={form.priority}
                onChange={(event) =>
                  setForm({ ...form, priority: event.target.value })
                }
                className={cn(" w-full")}
              >
                {["LOW", "MEDIUM", "HIGH", "URGENT"].map((priority) => (
                  <option key={priority} value={priority}>
                    {t(`priority.${priority}` as "priority.LOW")}
                  </option>
                ))}
              </NativeSelect>
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-semibold">
                {t("requests.details")} ({t("common.optional")})
              </span>
              <NativeSelect
                value={form.requestId}
                onChange={(event) =>
                  setForm({ ...form, requestId: event.target.value })
                }
                className={cn(" w-full")}
              >
                <option value="">–</option>
                {(requestsQuery.data?.requests ?? []).map((request) => (
                  <option key={request.id} value={request.id}>
                    {request.reference} — {request.title}
                  </option>
                ))}
              </NativeSelect>
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-semibold">
                {t("tickets.description")}
              </span>
              <Textarea
                required
                minLength={10}
                rows={4}
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
                className={cn(" w-full")}
              />
            </label>
          </div>
          {error && <p className="mt-3 text-xs text-error">{error}</p>}
          <Button
            disabled={loading}
            className={cn(
              " bg-primary text-primary-content border-primary hover:bg-primary-hover mt-4",
            )}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("tickets.create")}
          </Button>
        </form>
      )}

      <ListToolbar>
        <SearchField
          value={controls.search}
          onChange={controls.setSearch}
          placeholder={t("list.searchTickets")}
        />
        <FilterSelect
          value={controls.status}
          onChange={controls.setStatus}
          options={ticketStatuses.map((value) => ({
            value,
            label: t(`status.${value}` as "status.OPEN"),
          }))}
          allLabel={t("common.all")}
          ariaLabel={t("common.status")}
        />
        <FilterSelect
          value={priority}
          onChange={changePriority}
          options={priorities.map((value) => ({
            value,
            label: t(`priority.${value}` as "priority.LOW"),
          }))}
          allLabel={t("common.all")}
          ariaLabel={t("tickets.priority")}
        />
        <ArchiveTabs value={controls.archive} onChange={controls.setArchive} />
      </ListToolbar>

      {ticketsQuery.isLoading && <PageLoader />}
      {ticketsQuery.isError && (
        <ErrorState onRetry={() => void ticketsQuery.refetch()} />
      )}
      {!ticketsQuery.isLoading &&
        !ticketsQuery.isError &&
        pageData.total === 0 && (
          <div className="mt-5">
            <EmptyState
              title={t("tickets.noTickets")}
              text={t("tickets.text")}
              action={
                <Button
                  onClick={() => setShowForm(true)}
                  className={cn(
                    " bg-primary text-primary-content border-primary hover:bg-primary-hover h-8 px-3 text-sm",
                  )}
                >
                  {t("tickets.new")}
                </Button>
              }
            />
          </div>
        )}

      {pageData.total > 0 && (
        <div className="mt-5 space-y-3">
          {pageData.items.map((ticket) => (
            <Link
              key={ticket.id}
              to="/portal/tickets/$id"
              params={{ id: ticket.id }}
              className="flex flex-wrap items-center gap-4 rounded-box border border-base-300 bg-base-100 p-4 transition hover:border-primary/30 hover:bg-primary/5"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent-sky text-ink">
                <LifeBuoy className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{ticket.subject}</p>
                <p className="text-xs text-ink-muted">
                  {ticket.reference} · {formatDate(ticket.createdAt)}
                  {ticket.technician ? ` · ${ticket.technician.fullName}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  className={cn(" border-current bg-transparent h-4 text-xs")}
                >
                  {t(`priority.${ticket.priority}` as "priority.LOW")}
                </Badge>
                <StatusBadge status={ticket.status} />
                <ArrowRight className="h-4 w-4 text-ink-muted" />
              </div>
            </Link>
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
