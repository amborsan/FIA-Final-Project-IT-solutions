import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, Phone } from "lucide-react";
import { api, errorMessage } from "../lib/api";
import type { ContactMessage } from "../lib/types";
import { useI18n } from "../i18n/I18nContext";
import { useAdminNav } from "../components/nav";
import { DashboardShell, Panel } from "../components/DashboardShell";
import { ArchiveTabs, FilterSelect, ListToolbar, Pagination, SearchField } from "../components/ListControls";
import { EmptyState, ErrorState, PageLoader, StatusBadge } from "../components/ui";
import { filterByArchive, matchesSearch, paginate, useListControls } from "../lib/list";

export const Route = createFileRoute("/admin/inbox")({
  component: AdminInboxPage,
});

const contactStatuses = ["NEW", "READ", "REPLIED"];
const archivedStatuses = new Set(["REPLIED"]);

function AdminInboxPage() {
  const { t, formatDateTime } = useI18n();
  const nav = useAdminNav();
  const queryClient = useQueryClient();
  const controls = useListControls(6);
  const [error, setError] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "contacts"],
    queryFn: () => api<{ messages: ContactMessage[] }>("/admin/contacts"),
  });

  const messages = data?.messages ?? [];

  const filtered = filterByArchive(
    messages.filter(
      (message) =>
        (!controls.status || message.status === controls.status) &&
        matchesSearch(
          controls.search,
          message.name,
          message.email,
          message.phone,
          message.subject,
          message.message,
        ),
    ),
    controls.archive,
    (message) => archivedStatuses.has(message.status),
  );

  const pageData = paginate(filtered, controls.page, controls.pageSize);

  async function updateStatus(id: string, status: string) {
    setError("");
    try {
      await api(`/admin/contacts/${id}`, { method: "PATCH", body: { status } });
      await queryClient.invalidateQueries({ queryKey: ["admin", "contacts"] });
    } catch (caught) {
      setError(errorMessage(caught, t("common.error")));
    }
  }

  return (
    <DashboardShell nav={nav} title={t("admin.inbox")} subtitle={t("contact.text")}>
      {error && <div className="alert alert-error mb-4 text-sm">{error}</div>}

      <ListToolbar>
        <SearchField
          value={controls.search}
          onChange={controls.setSearch}
          placeholder={t("list.searchInbox")}
        />
        <FilterSelect
          value={controls.status}
          onChange={controls.setStatus}
          options={contactStatuses.map((value) => ({
            value,
            label: t(`status.${value}` as "status.NEW"),
          }))}
          allLabel={t("common.all")}
          ariaLabel={t("admin.contactStatus")}
        />
        <ArchiveTabs value={controls.archive} onChange={controls.setArchive} />
      </ListToolbar>

      {isLoading && <PageLoader />}
      {isError && <ErrorState onRetry={() => void refetch()} />}
      {!isLoading && !isError && pageData.total === 0 && (
        <div className="mt-5">
          <EmptyState title={t("admin.noResults")} />
        </div>
      )}

      {pageData.total > 0 && (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {pageData.items.map((message) => (
            <Panel key={message.id}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-bold">{message.subject}</p>
                  <p className="text-[11px] text-base-content/70">
                    {message.name} · {formatDateTime(message.createdAt)}
                  </p>
                </div>
                <StatusBadge status={message.status} />
              </div>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-base-content/65">
                {message.message}
              </p>

              <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-base-content/65">
                <a href={`mailto:${message.email}`} className="flex items-center gap-1 hover:text-primary">
                  <Mail className="h-3.5 w-3.5" /> {message.email}
                </a>
                {message.phone && (
                  <a href={`tel:${message.phone}`} className="flex items-center gap-1 hover:text-primary">
                    <Phone className="h-3.5 w-3.5" /> {message.phone}
                  </a>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-2 border-t border-base-200 pt-3">
                <button onClick={() => void updateStatus(message.id, "READ")} className="btn btn-outline btn-xs">
                  {t("admin.markRead")}
                </button>
                <button onClick={() => void updateStatus(message.id, "REPLIED")} className="btn btn-success btn-xs">
                  {t("admin.markReplied")}
                </button>
                <a href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(message.subject)}`} className="btn btn-primary btn-xs">
                  {t("chat.reply")}
                </a>
              </div>
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
