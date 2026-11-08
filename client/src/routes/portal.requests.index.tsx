import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Plus } from "lucide-react";
import { api } from "../lib/api";
import type { ServiceRequest } from "../lib/types";
import { useI18n } from "../i18n/I18nContext";
import { usePortalNav } from "../components/nav";
import { DashboardShell } from "../components/DashboardShell";
import { ArchiveTabs, FilterSelect, ListToolbar, Pagination, SearchField } from "../components/ListControls";
import { EmptyState, ErrorState, PageLoader, StatusBadge } from "../components/ui";
import { filterByArchive, matchesSearch, paginate, useListControls } from "../lib/list";

export const Route = createFileRoute("/portal/requests/")({
  component: RequestsPage,
});

const requestStatuses = [
  "NEW",
  "REVIEWING",
  "QUOTED",
  "APPROVED",
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

const archivedStatuses = new Set(["COMPLETED", "CANCELLED"]);

function RequestsPage() {
  const { t, pick, formatDate, formatMoney } = useI18n();
  const nav = usePortalNav();
  const controls = useListControls();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["requests"],
    queryFn: () => api<{ requests: ServiceRequest[] }>("/requests"),
  });

  const requests = data?.requests ?? [];

  const filtered = filterByArchive(
    requests.filter(
      (request) =>
        (!controls.status || request.status === controls.status) &&
        matchesSearch(
          controls.search,
          request.reference,
          request.title,
          request.service?.nameEn,
          request.service?.nameDe,
        ),
    ),
    controls.archive,
    (request) => archivedStatuses.has(request.status),
  );

  const pageData = paginate(filtered, controls.page, controls.pageSize);

  return (
    <DashboardShell
      nav={nav}
      title={t("requests.title")}
      subtitle={t("requests.text")}
      actions={
        <Link to="/quote" search={{ service: undefined }} className="btn btn-primary btn-sm">
          <Plus className="h-4 w-4" /> {t("requests.new")}
        </Link>
      }
    >
      <ListToolbar>
        <SearchField
          value={controls.search}
          onChange={controls.setSearch}
          placeholder={t("list.searchRequests")}
        />
        <FilterSelect
          value={controls.status}
          onChange={controls.setStatus}
          options={requestStatuses.map((value) => ({
            value,
            label: t(`status.${value}` as "status.NEW"),
          }))}
          allLabel={t("common.all")}
          ariaLabel={t("common.status")}
        />
        <ArchiveTabs value={controls.archive} onChange={controls.setArchive} />
      </ListToolbar>

      {isLoading && <PageLoader />}
      {isError && <ErrorState onRetry={() => void refetch()} />}
      {!isLoading && !isError && pageData.total === 0 && (
        <div className="mt-5">
          <EmptyState
            title={t("requests.noQuotes")}
            text={t("requests.text")}
            action={
              <Link to="/quote" search={{ service: undefined }} className="btn btn-primary btn-sm">
                {t("requests.new")}
              </Link>
            }
          />
        </div>
      )}

      {pageData.total > 0 && (
        <div className="mt-5 overflow-x-auto rounded-box border border-base-300 bg-base-100">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>{t("common.reference")}</th>
                <th>{t("common.title")}</th>
                <th>{t("requests.service")}</th>
                <th>{t("requests.createdAt")}</th>
                <th>{t("requests.budget")}</th>
                <th>{t("requests.status")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {pageData.items.map((request) => (
                <tr key={request.id}>
                  <td className="font-mono text-xs">{request.reference}</td>
                  <td>
                    <p className="max-w-56 truncate font-semibold">{request.title}</p>
                    <p className="text-[11px] text-base-content/70">
                      {request.technician?.fullName ?? t("requests.unassigned")}
                    </p>
                  </td>
                  <td className="text-xs">
                    {request.service ? pick(request.service.nameEn, request.service.nameDe) : "–"}
                  </td>
                  <td className="text-xs">{formatDate(request.createdAt)}</td>
                  <td className="text-xs">{request.budget ? formatMoney(request.budget) : "–"}</td>
                  <td>
                    <StatusBadge status={request.status} />
                  </td>
                  <td>
                    <Link
                      to="/portal/requests/$id"
                      params={{ id: request.id }}
                      className="btn btn-ghost btn-xs"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
