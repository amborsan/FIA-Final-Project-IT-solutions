import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Activity as ActivityIcon } from "lucide-react";
import { api } from "../lib/api";
import type { Activity } from "../lib/types";
import { useI18n } from "../i18n/I18nContext";
import { useAdminNav } from "../components/nav";
import { AdminDashboardShell as DashboardShell } from "../components/AdminDashboardShell";
import {
  FilterSelect,
  ListToolbar,
  Pagination,
  SearchField,
} from "../components/ListControls";
import { EmptyState, ErrorState, PageLoader } from "../components/ui";
import { matchesSearch, paginate, useListControls } from "../lib/list";

export const Route = createFileRoute("/admin/activity")({
  component: AdminActivityPage,
});

function AdminActivityPage() {
  const { t, formatDateTime } = useI18n();
  const nav = useAdminNav();
  const controls = useListControls(25);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "activity"],
    queryFn: () => api<{ activity: Activity[] }>("/admin/activity"),
  });

  const entries = data?.activity ?? [];

  // The API does not expose a fixed enum here, so build the filter from the data.
  const entityTypes = Array.from(
    new Set(
      entries
        .map((entry) => entry.entityType)
        .filter((value): value is string => !!value),
    ),
  ).sort();

  const filtered = entries.filter(
    (entry) =>
      (!controls.status || entry.entityType === controls.status) &&
      matchesSearch(
        controls.search,
        entry.action,
        entry.description,
        entry.entityType,
        entry.user?.fullName,
      ),
  );

  const pageData = paginate(filtered, controls.page, controls.pageSize);

  return (
    <DashboardShell
      nav={nav}
      title={t("admin.activity")}
      subtitle={t("admin.recentActivity")}
    >
      <ListToolbar>
        <SearchField
          value={controls.search}
          onChange={controls.setSearch}
          placeholder={t("list.searchActivity")}
        />
        <FilterSelect
          value={controls.status}
          onChange={controls.setStatus}
          options={entityTypes.map((value) => ({ value, label: value }))}
          allLabel={t("common.all")}
          ariaLabel={t("common.category")}
        />
      </ListToolbar>

      {isLoading && <PageLoader />}
      {isError && <ErrorState onRetry={() => void refetch()} />}
      {!isLoading && !isError && pageData.total === 0 && (
        <div className="mt-5">
          <EmptyState title={t("admin.noActivity")} />
        </div>
      )}

      {pageData.total > 0 && (
        <div className="mt-5 space-y-2">
          {pageData.items.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start gap-3 rounded-box border border-base-300 bg-base-100 p-3"
            >
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ActivityIcon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm">{entry.description}</p>
                <p className="text-xs text-ink-muted">
                  {entry.user?.fullName || "System"}
                  {entry.user?.role
                    ? ` · ${t(`role.${entry.user.role}` as "role.ADMIN")}`
                    : ""}{" "}
                  · {formatDateTime(entry.createdAt)}
                </p>
                {entry.entityType && (
                  <p className="mt-0.5 tabular-nums text-xs text-ink-muted">
                    {entry.entityType}
                  </p>
                )}
              </div>
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
