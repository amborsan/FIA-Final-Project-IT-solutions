import { buttonVariants } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { NativeSelect } from "@/components/ui/native-select";
import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, LifeBuoy } from "lucide-react";
import { api, errorMessage } from "../lib/api";
import type { Ticket } from "../lib/types";
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

export const Route = createFileRoute("/technician/tickets/")({
  component: TechnicianTicketsPage,
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

function TechnicianTicketsPage() {
  const { t, formatDate } = useI18n();
  const nav = useTechnicianNav();
  const queryClient = useQueryClient();
  const controls = useListControls();
  const [priority, setPriority] = useState("");
  const [error, setError] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["tickets"],
    queryFn: () => api<{ tickets: Ticket[] }>("/tickets"),
  });

  const tickets = data?.tickets ?? [];

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
          ticket.customer?.fullName,
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

  async function updateStatus(id: string, status: string) {
    setError("");
    try {
      await api(`/tickets/${id}/status`, { method: "PATCH", body: { status } });
      await queryClient.invalidateQueries({ queryKey: ["tickets"] });
    } catch (caught) {
      setError(errorMessage(caught, t("common.error")));
    }
  }

  return (
    <DashboardShell
      nav={nav}
      title={t("technician.assignedTickets")}
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

      {isLoading && <PageLoader />}
      {isError && <ErrorState onRetry={() => void refetch()} />}
      {!isLoading && !isError && pageData.total === 0 && (
        <div className="mt-5">
          <EmptyState title={t("technician.noTickets")} />
        </div>
      )}

      {pageData.total > 0 && (
        <div className="mt-5 space-y-3">
          {pageData.items.map((ticket) => (
            <div
              key={ticket.id}
              className="flex flex-wrap items-center gap-4 rounded-box border border-base-300 bg-base-100 p-4"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent-sky text-ink">
                <LifeBuoy className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{ticket.subject}</p>
                <p className="text-xs text-ink-muted">
                  {ticket.reference} · {ticket.customer?.fullName} ·{" "}
                  {formatDate(ticket.createdAt)}
                </p>
              </div>
              <Badge
                className={cn(" border-current bg-transparent h-4 text-xs")}
              >
                {t(`priority.${ticket.priority}` as "priority.LOW")}
              </Badge>
              <StatusBadge status={ticket.status} />
              <NativeSelect
                value={ticket.status}
                onChange={(event) =>
                  void updateStatus(ticket.id, event.target.value)
                }
                className={cn(" h-6 px-2 text-xs")}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {t(`status.${status}` as "status.OPEN")}
                  </option>
                ))}
              </NativeSelect>
              <Link
                to="/technician/tickets/$id"
                params={{ id: ticket.id }}
                className={cn(
                  buttonVariants(),
                  " border-transparent bg-transparent text-base-content hover:bg-base-content/10 h-6 px-2 text-xs",
                )}
              >
                <ArrowRight className="h-4 w-4" />
              </Link>
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
