import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Lock, Send } from "lucide-react";
import { api, errorMessage } from "../lib/api";
import type { Ticket, User } from "../lib/types";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n/I18nContext";
import { useAdminNav } from "../components/nav";
import { Panel } from "../components/DashboardShell";
import { AdminDashboardShell as DashboardShell } from "../components/AdminDashboardShell";
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

export const Route = createFileRoute("/admin/tickets")({
  component: AdminTicketsPage,
});

const statuses = [
  "OPEN",
  "IN_PROGRESS",
  "WAITING_CUSTOMER",
  "RESOLVED",
  "CLOSED",
];
const priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const archivedStatuses = new Set(["RESOLVED", "CLOSED"]);

function AdminTicketsPage() {
  const { user } = useAuth();
  const { t, formatDateTime, formatDate } = useI18n();
  const nav = useAdminNav();
  const queryClient = useQueryClient();
  const controls = useListControls(8);
  const [priority, setPriority] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [internal, setInternal] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const ticketsQuery = useQuery({
    queryKey: ["tickets"],
    queryFn: () => api<{ tickets: Ticket[] }>("/tickets"),
  });
  const ticketQuery = useQuery({
    queryKey: ["ticket", selectedId],
    queryFn: () => api<{ ticket: Ticket }>(`/tickets/${selectedId}`),
    enabled: !!selectedId,
    refetchInterval: selectedId ? 20000 : false,
  });
  const techniciansQuery = useQuery({
    queryKey: ["admin", "users", "TECHNICIAN"],
    queryFn: () => api<{ users: User[] }>("/admin/users?role=TECHNICIAN"),
  });

  const tickets = ticketsQuery.data?.tickets ?? [];
  const ticket = ticketQuery.data?.ticket;

  const filteredTickets = filterByArchive(
    tickets.filter(
      (entry) =>
        (!controls.status || entry.status === controls.status) &&
        (!priority || entry.priority === priority) &&
        matchesSearch(
          controls.search,
          entry.reference,
          entry.subject,
          entry.customer?.fullName,
          entry.customer?.email,
        ),
    ),
    controls.archive,
    (entry) => archivedStatuses.has(entry.status),
  );

  const pageData = paginate(filteredTickets, controls.page, controls.pageSize);

  function changePriority(value: string) {
    setPriority(value);
    controls.setPage(1);
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages?.length]);

  async function sendReply(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedId || !reply.trim()) return;
    setSending(true);
    setError("");
    try {
      await api(`/tickets/${selectedId}/messages`, {
        method: "POST",
        body: { body: reply, isInternal: internal },
      });
      setReply("");
      await queryClient.invalidateQueries({ queryKey: ["ticket", selectedId] });
      await queryClient.invalidateQueries({ queryKey: ["tickets"] });
    } catch (caught) {
      setError(errorMessage(caught, t("common.error")));
    } finally {
      setSending(false);
    }
  }

  async function updateStatus(status: string) {
    if (!selectedId) return;
    try {
      await api(`/tickets/${selectedId}/status`, {
        method: "PATCH",
        body: { status },
      });
      await queryClient.invalidateQueries({ queryKey: ["ticket", selectedId] });
      await queryClient.invalidateQueries({ queryKey: ["tickets"] });
    } catch (caught) {
      setError(errorMessage(caught, t("common.error")));
    }
  }

  async function assign(technicianId: string) {
    if (!selectedId) return;
    try {
      await api(`/tickets/${selectedId}/assign`, {
        method: "PATCH",
        body: { technicianId: technicianId || null },
      });
      await queryClient.invalidateQueries({ queryKey: ["ticket", selectedId] });
      await queryClient.invalidateQueries({ queryKey: ["tickets"] });
    } catch (caught) {
      setError(errorMessage(caught, t("common.error")));
    }
  }

  return (
    <DashboardShell
      nav={nav}
      title={t("admin.tickets")}
      subtitle={t("tickets.text")}
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
          placeholder={t("list.searchTickets")}
        />
        <FilterSelect
          value={controls.status}
          onChange={controls.setStatus}
          options={statuses.map((value) => ({
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
            <EmptyState title={t("tickets.noTickets")} />
          </div>
        )}

      <div className="mt-5 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div>
          <div className="space-y-2">
            {pageData.items.map((entry) => (
              <button
                key={entry.id}
                onClick={() => setSelectedId(entry.id)}
                className={`w-full rounded-box border p-3 text-left transition ${
                  selectedId === entry.id
                    ? "border-primary bg-primary/5"
                    : "border-base-300 bg-base-100 hover:border-primary/30"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="tabular-nums text-xs text-ink-muted">
                    {entry.reference}
                  </span>
                  <StatusBadge status={entry.status} />
                </div>
                <p className="mt-1 truncate text-sm font-semibold">
                  {entry.subject}
                </p>
                <p className="text-xs text-ink-muted">
                  {entry.customer?.fullName} · {formatDate(entry.createdAt)}
                </p>
              </button>
            ))}
          </div>

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
        </div>

        <div>
          {!selectedId && (
            <div className="rounded-box border border-dashed border-base-300 bg-base-100 p-10 text-center text-sm text-ink-muted">
              {t("tickets.details")}
            </div>
          )}
          {selectedId && ticketQuery.isLoading && <PageLoader />}
          {selectedId && ticket && (
            <div className="space-y-4">
              <Panel
                title={ticket.subject}
                action={<StatusBadge status={ticket.status} />}
              >
                <div className="max-h-[26rem] space-y-3 overflow-y-auto pr-1 chat-scroll">
                  {(ticket.messages ?? []).map((message) => {
                    const mine = message.authorId === user?.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${mine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                            message.isInternal
                              ? "border border-warning/40 bg-warning/10"
                              : mine
                                ? "rounded-br-sm bg-primary text-primary-content"
                                : "rounded-bl-sm bg-base-200"
                          }`}
                        >
                          <p className="flex items-center gap-1 text-xs font-semibold opacity-70">
                            {message.isInternal && <Lock className="h-3 w-3" />}
                            {message.author?.fullName || t("tickets.customer")}
                          </p>
                          <p className="mt-1 whitespace-pre-wrap break-words">
                            {message.body}
                          </p>
                          <p className="mt-1 text-xs opacity-55">
                            {formatDateTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                <form
                  onSubmit={sendReply}
                  className="mt-4 border-t border-hairline pt-4"
                >
                  <Textarea
                    value={reply}
                    onChange={(event) => setReply(event.target.value)}
                    required
                    rows={3}
                    className={cn(" w-full text-sm")}
                    placeholder={t("chat.replyPlaceholder")}
                  />
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <label className="flex items-center gap-2 text-xs text-ink-muted">
                      <input
                        type="checkbox"
                        className={cn(
                          "appearance-auto accent-primary size-6 shrink-0 rounded-field border border-input focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary size-4",
                        )}
                        checked={internal}
                        onChange={(event) => setInternal(event.target.checked)}
                      />
                      {t("tickets.internalNote")}
                    </label>
                    <Button
                      disabled={sending || !reply.trim()}
                      className={cn(
                        " bg-primary text-primary-content border-primary hover:bg-primary-hover h-8 px-3 text-sm",
                      )}
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      {t("tickets.sendReply")}
                    </Button>
                  </div>
                </form>
              </Panel>

              <Panel title={t("tickets.details")}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold">
                      {t("common.status")}
                    </span>
                    <NativeSelect
                      value={ticket.status}
                      onChange={(event) =>
                        void updateStatus(event.target.value)
                      }
                      className={cn(" h-8 text-xs w-full")}
                    >
                      {statuses.map((value) => (
                        <option key={value} value={value}>
                          {t(`status.${value}` as "status.OPEN")}
                        </option>
                      ))}
                    </NativeSelect>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold">
                      {t("admin.assignTechnician")}
                    </span>
                    <NativeSelect
                      value={ticket.assignedTechnicianId ?? ""}
                      onChange={(event) => void assign(event.target.value)}
                      className={cn(" h-8 text-xs w-full")}
                    >
                      <option value="">{t("common.unassigned")}</option>
                      {(techniciansQuery.data?.users ?? []).map(
                        (technician) => (
                          <option key={technician.id} value={technician.id}>
                            {technician.fullName}
                          </option>
                        ),
                      )}
                    </NativeSelect>
                  </label>
                  <div className="text-xs text-ink-muted">
                    <p className="font-semibold text-ink-soft">
                      {t("tickets.customer")}
                    </p>
                    <p>{ticket.customer?.fullName}</p>
                    <p>{ticket.customer?.email}</p>
                  </div>
                  <div className="text-xs text-ink-muted">
                    <p className="font-semibold text-ink-soft">
                      {t("tickets.priority")}
                    </p>
                    <p>{t(`priority.${ticket.priority}` as "priority.LOW")}</p>
                  </div>
                </div>
              </Panel>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
